import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { stripAccents } from '../config.js';

const CACHE_DIR = join(import.meta.dirname, '..', 'cache');

function progressFile(leagueId) {
  return join(CACHE_DIR, `apifb_${leagueId}_progress.json`);
}

function buildApifbLookup(leagueConfig) {
  const lookup = {};
  for (const [key, team] of Object.entries(leagueConfig.teams)) {
    const names = team.apifootball;
    if (!names) continue;
    for (const name of names) {
      lookup[name.toLowerCase()] = key;
      lookup[stripAccents(name).toLowerCase()] = key;
    }
  }
  return lookup;
}

function makeResolveTeamKey(leagueConfig) {
  const apifbNameLookup = buildApifbLookup(leagueConfig);
  return function resolveTeamKey(name) {
    if (!name) return null;
    const clean = name.trim();
    let key = apifbNameLookup[clean.toLowerCase()];
    if (key) return key;
    key = apifbNameLookup[stripAccents(clean).toLowerCase()];
    if (key) return key;
    // Fuzzy: check if any known name is contained
    for (const [k, team] of Object.entries(leagueConfig.teams)) {
      const names = team.apifootball;
      if (!names) continue;
      for (const n of names) {
        if (clean.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(clean.toLowerCase())) {
          return k;
        }
      }
    }
    return null;
  };
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true });
}

// --- Progress tracking ---

async function loadProgress(leagueId) {
  try {
    const file = progressFile(leagueId);
    if (existsSync(file)) {
      return JSON.parse(await readFile(file, 'utf8'));
    }
  } catch { /* fresh start */ }
  return { fetchedFixtures: [], lastRun: null, totalRequests: 0 };
}

async function saveProgress(leagueId, progress) {
  await ensureCacheDir();
  await writeFile(progressFile(leagueId), JSON.stringify(progress, null, 2), 'utf8');
}

// --- Caching (permanent for finished matches) ---

function cacheFile(leagueId, key) {
  return join(CACHE_DIR, `apifb_${leagueId}_${key}.json`);
}

async function readCache(leagueId, key) {
  const file = cacheFile(leagueId, key);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch { return null; }
}

async function writeCache(leagueId, key, data) {
  await ensureCacheDir();
  await writeFile(cacheFile(leagueId, key), JSON.stringify(data), 'utf8');
}

// --- API calls ---

let requestsThisRun = 0;
const DAILY_LIMIT = 100;
const REQUEST_DELAY = 1200;

async function fetchAPI(endpoint, params, leagueId) {
  const apiKey = process.env.APIFOOTBALL_KEY;
  if (!apiKey) {
    throw new Error('APIFOOTBALL_KEY environment variable not set');
  }

  const baseUrl = 'https://v3.football.api-sports.io';
  const url = new URL(endpoint, baseUrl);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const cacheKeyStr = endpoint.replace(/\//g, '_') + '_' + Object.entries(params).map(([k, v]) => `${k}${v}`).join('_');

  const cached = await readCache(leagueId, cacheKeyStr);
  if (cached) return { data: cached, cached: true };

  if (requestsThisRun >= DAILY_LIMIT) {
    console.log(`  [quota] Daily limit reached (${DAILY_LIMIT} requests). Stopping.`);
    return { data: null, cached: false, quotaExhausted: true };
  }

  await delay(REQUEST_DELAY);

  const res = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': apiKey,
      'Accept': 'application/json',
    },
  });

  requestsThisRun++;

  if (!res.ok) {
    console.error(`  [error] API-Football HTTP ${res.status} for ${endpoint}`);
    return { data: null, cached: false };
  }

  const json = await res.json();

  if (json.errors && Object.keys(json.errors).length > 0) {
    console.error(`  [error] API-Football errors:`, json.errors);
    return { data: null, cached: false };
  }

  await writeCache(leagueId, cacheKeyStr, json.response || []);
  return { data: json.response || [], cached: false };
}

// --- Fixtures ---

async function fetchFixtures(season, leagueConfig) {
  const apifb = leagueConfig.apifootball;
  console.log(`  Fetching fixtures for season ${season}...`);
  const { data, cached, quotaExhausted } = await fetchAPI('/fixtures', {
    league: apifb.leagueId,
    season: season,
    status: 'FT',
  }, leagueConfig.id);

  if (quotaExhausted) return { fixtures: [], quotaExhausted: true };
  if (!data) return { fixtures: [], quotaExhausted: false };

  console.log(`    ${cached ? '[cache]' : '[api]'} Got ${data.length} fixtures for ${season}`);
  return { fixtures: data, quotaExhausted: false };
}

// --- Stats ---

async function fetchFixtureStats(fixtureId, leagueId) {
  const { data, cached, quotaExhausted } = await fetchAPI('/fixtures/statistics', {
    fixture: fixtureId,
  }, leagueId);

  if (quotaExhausted) return { stats: null, quotaExhausted: true };
  if (!data || data.length === 0) return { stats: null, quotaExhausted: false };

  return { stats: data, quotaExhausted: false };
}

// --- Stat mapping ---

const STAT_MAP = {
  'shots on goal': 'shotsOnTarget',
  'total shots': 'shotsTotal',
  'corner kicks': 'corners',
  'fouls': 'fouls',
  'yellow cards': 'yellowCards',
  'red cards': 'redCards',
  'offsides': 'offsides',
  'ball possession': 'possession',
  'goalkeeper saves': 'saves',
  'expected_goals': 'xG',
};

function parseStats(statsArray) {
  if (!statsArray || !Array.isArray(statsArray)) return null;

  const result = {
    possession: 50,
    shotsTotal: 0,
    shotsOnTarget: 0,
    corners: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    offsides: 0,
    saves: 0,
    xG: 0,
    freeKicks: 0,
    firstGoalMinute: null,
  };

  for (const stat of statsArray) {
    const type = (stat.type || '').toLowerCase();
    const mappedKey = STAT_MAP[type];
    if (!mappedKey) continue;

    let val = stat.value;
    if (val === null || val === undefined) {
      val = 0;
    } else if (typeof val === 'string') {
      val = parseFloat(val.replace('%', '')) || 0;
    }

    result[mappedKey] = val;
  }

  return result;
}

// --- Main orchestrator ---

export { makeResolveTeamKey, fetchAPI };

export async function loadAPIFootball(leagueConfig) {
  const apifb = leagueConfig.apifootball;
  if (!apifb) {
    console.log('\n=== API-Football: Not configured for this league ===');
    return [];
  }

  console.log(`\n=== API-Football Historical Data (${leagueConfig.name}) ===`);

  const apiKey = process.env.APIFOOTBALL_KEY;
  if (!apiKey) {
    console.log('  [skip] APIFOOTBALL_KEY not set. Skipping API-Football source.');
    return [];
  }

  requestsThisRun = 0;
  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  const progress = await loadProgress(leagueConfig.id);
  const fetchedSet = new Set(progress.fetchedFixtures);
  const allMatches = [];
  let quotaExhausted = false;

  console.log(`  Progress: ${fetchedSet.size} fixtures already have stats cached`);
  console.log(`  Seasons: ${apifb.seasons.join(', ')}`);

  // Step 1: Fetch all fixture lists
  const allFixtures = [];
  for (const season of apifb.seasons) {
    if (quotaExhausted) break;
    const { fixtures, quotaExhausted: qe } = await fetchFixtures(season, leagueConfig);
    quotaExhausted = qe;
    for (const f of fixtures) {
      allFixtures.push({ ...f, _season: season });
    }
  }

  console.log(`  Total fixtures across all seasons: ${allFixtures.length}`);

  // Step 2: For each fixture, fetch stats if not already cached
  const pendingFixtures = allFixtures.filter(f => !fetchedSet.has(String(f.fixture.id)));
  console.log(`  Fixtures needing stats: ${pendingFixtures.length}`);

  let statsOk = 0;
  let statsSkipped = 0;

  for (const f of pendingFixtures) {
    if (quotaExhausted) break;

    const fixtureId = f.fixture.id;
    const { stats, quotaExhausted: qe } = await fetchFixtureStats(fixtureId, leagueConfig.id);
    quotaExhausted = qe;

    if (quotaExhausted) break;

    if (stats) {
      fetchedSet.add(String(fixtureId));
      statsOk++;
    } else {
      statsSkipped++;
    }

    if ((statsOk + statsSkipped) % 20 === 0) {
      console.log(`    Progress: ${statsOk + statsSkipped}/${pendingFixtures.length} (${statsOk} OK, quota used: ${requestsThisRun})`);
      await saveProgress(leagueConfig.id, {
        fetchedFixtures: [...fetchedSet],
        lastRun: new Date().toISOString(),
        totalRequests: progress.totalRequests + requestsThisRun,
      });
    }
  }

  // Step 3: Build match objects from all fixtures with cached stats
  let unmappedTeams = new Set();
  for (const f of allFixtures) {
    const fixtureId = f.fixture.id;
    const homeTeamName = f.teams?.home?.name;
    const awayTeamName = f.teams?.away?.name;
    const homeKey = resolveTeamKey(homeTeamName);
    const awayKey = resolveTeamKey(awayTeamName);

    if (!homeKey) unmappedTeams.add(homeTeamName);
    if (!awayKey) unmappedTeams.add(awayTeamName);
    if (!homeKey || !awayKey) continue;

    const date = f.fixture.date ? f.fixture.date.slice(0, 10) : null;
    if (!date) continue;

    const match = {
      date,
      homeTeam: homeKey,
      awayTeam: awayKey,
      homeGoals: f.goals?.home ?? 0,
      awayGoals: f.goals?.away ?? 0,
      source: 'apifootball',
      seasonId: `${f._season}`,
      hasDetailedStats: false,
    };

    const statsCacheKey = `_fixtures_statistics_fixture${fixtureId}`;
    const cachedStats = await readCache(leagueConfig.id, statsCacheKey);

    if (cachedStats && cachedStats.length >= 2) {
      let homeStats = null;
      let awayStats = null;

      for (const teamStats of cachedStats) {
        const teamName = teamStats.team?.name;
        const teamKey = resolveTeamKey(teamName);
        const parsed = parseStats(teamStats.statistics);
        if (!parsed) continue;

        if (teamKey === homeKey) homeStats = parsed;
        else if (teamKey === awayKey) awayStats = parsed;
      }

      if (homeStats && awayStats) {
        homeStats.freeKicks = awayStats.fouls || 0;
        awayStats.freeKicks = homeStats.fouls || 0;
        match.homeStats = homeStats;
        match.awayStats = awayStats;
        match.hasDetailedStats = true;
        match.source = 'apifootball+stats';
      }
    }

    allMatches.push(match);
  }

  // Save final progress
  await saveProgress(leagueConfig.id, {
    fetchedFixtures: [...fetchedSet],
    lastRun: new Date().toISOString(),
    totalRequests: progress.totalRequests + requestsThisRun,
  });

  const withStats = allMatches.filter(m => m.hasDetailedStats).length;
  console.log(`\n  API-Football summary:`);
  console.log(`    Matches loaded: ${allMatches.length}`);
  console.log(`    With detailed stats: ${withStats}`);
  console.log(`    API requests this run: ${requestsThisRun}`);
  if (quotaExhausted) {
    console.log(`    [!] Quota exhausted. Run again tomorrow to continue.`);
  }
  if (unmappedTeams.size > 0) {
    console.log(`    [!] Unmapped teams: ${[...unmappedTeams].join(', ')}`);
    console.log(`        Add these to league config teams.*.apifootball`);
  }

  return allMatches;
}

/**
 * Utility: Discover team names from API-Football for a season
 */
export async function discoverTeamNames(leagueConfig, season) {
  const apifb = leagueConfig.apifootball;
  if (!apifb) {
    console.log('  API-Football not configured for this league');
    return;
  }

  const effectiveSeason = season || apifb.seasons[apifb.seasons.length - 1];
  console.log(`\n=== Discovering API-Football team names for ${leagueConfig.name} season ${effectiveSeason} ===`);

  const { data } = await fetchAPI('/teams', {
    league: apifb.leagueId,
    season: effectiveSeason,
  }, leagueConfig.id);

  if (!data) {
    console.log('  Failed to fetch teams');
    return;
  }

  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  console.log(`  Found ${data.length} teams:\n`);
  for (const t of data) {
    const name = t.team?.name || '?';
    const key = resolveTeamKey(name);
    const status = key ? `→ ${key}` : '→ ??? (UNMAPPED)';
    console.log(`    ${name} ${status}`);
  }
}
