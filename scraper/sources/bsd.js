import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { stripAccents } from '../config.js';

const CACHE_DIR = join(import.meta.dirname, '..', 'cache');
const CACHE_TTL_PREDICTIONS = 12 * 60 * 60 * 1000; // 12h for predictions
const CACHE_TTL_MATCHES = 7 * 24 * 60 * 60 * 1000;  // 7 days for historical
const REQUEST_DELAY = 300; // ms between requests
const BASE_URL = 'https://sports.bzzoiro.com';

function buildBSDLookup(leagueConfig) {
  const lookup = {};
  for (const [key, team] of Object.entries(leagueConfig.teams)) {
    const names = team.bsd;
    if (!names) continue;
    for (const name of names) {
      lookup[name.toLowerCase()] = key;
      lookup[stripAccents(name).toLowerCase()] = key;
    }
  }
  return lookup;
}

function makeResolveTeamKey(leagueConfig) {
  const bsdNameLookup = buildBSDLookup(leagueConfig);
  return function resolveTeamKey(name) {
    if (!name) return null;
    const clean = name.trim();
    let key = bsdNameLookup[clean.toLowerCase()];
    if (key) return key;
    key = bsdNameLookup[stripAccents(clean).toLowerCase()];
    if (key) return key;
    // Fuzzy: check if any known name is contained
    for (const [k, team] of Object.entries(leagueConfig.teams)) {
      const names = team.bsd;
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

function cacheFile(leagueId, key) {
  return join(CACHE_DIR, `bsd_${leagueId}_${key}.json`);
}

/**
 * Fetch paginated results from BSD API with caching.
 * Follows `next` URLs to collect all pages.
 */
async function fetchBSDPaginated(endpoint, params, leagueId, cacheKey, ttl) {
  await ensureCacheDir();
  const file = cacheFile(leagueId, cacheKey);

  // Check cache
  if (existsSync(file)) {
    try {
      const stat = statSync(file);
      if (Date.now() - stat.mtimeMs < ttl) {
        const data = JSON.parse(await readFile(file, 'utf8'));
        return { data, cached: true };
      }
    } catch { /* cache miss */ }
  }

  const apiKey = process.env.BSD_API_KEY;
  if (!apiKey) {
    return { data: null, cached: false };
  }

  const url = new URL(endpoint, BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const allResults = [];
  let nextUrl = url.toString();
  let pages = 0;

  while (nextUrl && pages < 50) {
    await delay(REQUEST_DELAY);
    const res = await fetch(nextUrl, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`  [error] BSD HTTP ${res.status} for ${nextUrl}`);
      break;
    }

    const data = await res.json();
    const results = data.results || [];
    allResults.push(...results);
    nextUrl = data.next || null;
    pages++;
  }

  if (allResults.length > 0) {
    await writeFile(file, JSON.stringify(allResults), 'utf8');
  }
  return { data: allResults, cached: false };
}

/**
 * Load historical matches from BSD with real xG data.
 * BSD provides: scores, xG. No detailed stats (corners, shots, cards).
 */
export async function loadBSD(leagueConfig) {
  const bsd = leagueConfig.bsd;
  if (!bsd) {
    console.log('\n=== BSD: Not configured for this league ===');
    return [];
  }

  console.log(`\n=== BSD Historical Data (${leagueConfig.name}) ===`);

  const apiKey = process.env.BSD_API_KEY;
  if (!apiKey) {
    console.log('  [skip] BSD_API_KEY not set. Skipping BSD source.');
    return [];
  }

  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  const allMatches = [];
  const unmappedTeams = new Set();

  // Determine BSD league IDs to query (Liga MX has Apertura + Clausura)
  const leagueIds = [];
  if (bsd.leagueIdApertura && bsd.leagueIdClausura) {
    leagueIds.push(bsd.leagueIdApertura, bsd.leagueIdClausura);
  } else {
    leagueIds.push(bsd.leagueId);
  }

  // Date range: current season
  const today = new Date().toISOString().slice(0, 10);
  const seasonStart = leagueConfig.tournament.type === 'biannual'
    ? `${new Date().getFullYear() - 1}-07-01`
    : `${new Date().getMonth() >= 7 ? new Date().getFullYear() : new Date().getFullYear() - 1}-08-01`;

  for (const lid of leagueIds) {
    console.log(`  Querying BSD league ${lid}...`);
    const cacheKey = `events_${lid}`;

    const { data: events, cached } = await fetchBSDPaginated('/api/events/', {
      league: lid,
      date_from: seasonStart,
      date_to: today,
      status: 'finished',
    }, leagueConfig.id, cacheKey, CACHE_TTL_MATCHES);

    if (!events || events.length === 0) {
      console.log(`    ${cached ? '[cache]' : '[api]'} No events found`);
      continue;
    }

    console.log(`    ${cached ? '[cache]' : '[api]'} ${events.length} events`);

    for (const ev of events) {
      // BSD returns home_team/away_team as strings
      const homeName = typeof ev.home_team === 'string' ? ev.home_team : (ev.home_team?.name || '');
      const awayName = typeof ev.away_team === 'string' ? ev.away_team : (ev.away_team?.name || '');
      const homeKey = resolveTeamKey(homeName);
      const awayKey = resolveTeamKey(awayName);

      if (!homeKey) unmappedTeams.add(homeName);
      if (!awayKey) unmappedTeams.add(awayName);
      if (!homeKey || !awayKey) continue;

      const date = (ev.event_date || '').slice(0, 10);
      if (!date) continue;

      // Only finished matches with scores
      if (ev.home_score == null || ev.away_score == null) continue;

      const homeXG = parseFloat(ev.actual_home_xg || 0) || 0;
      const awayXG = parseFloat(ev.actual_away_xg || 0) || 0;

      allMatches.push({
        date,
        homeTeam: homeKey,
        awayTeam: awayKey,
        homeGoals: parseInt(ev.home_score) || 0,
        awayGoals: parseInt(ev.away_score) || 0,
        source: homeXG > 0 ? 'bsd+predictions' : 'bsd',
        // BSD doesn't provide detailed stats (corners, shots, cards) — only xG
        hasDetailedStats: false,
        homeStats: { xG: homeXG },
        awayStats: { xG: awayXG },
      });
    }
  }

  const withXG = allMatches.filter(m => m.homeStats.xG > 0).length;
  console.log(`\n  BSD summary:`);
  console.log(`    Matches loaded: ${allMatches.length}`);
  console.log(`    With real xG: ${withXG}`);
  if (unmappedTeams.size > 0) {
    console.log(`    [!] Unmapped teams: ${[...unmappedTeams].join(', ')}`);
    console.log(`        Add these to league config teams.*.bsd`);
  }

  return allMatches;
}

/**
 * Fetch ML predictions for upcoming/recent matches from BSD.
 * BSD predictions include: prob_home_win, prob_draw, prob_away_win,
 * expected_home_goals, expected_away_goals, prob_over_25, prob_btts_yes,
 * confidence, model_version, most_likely_score, *_recommend booleans.
 * Probabilities are in percentage (0-100).
 */
export async function fetchBSDPredictions(leagueConfig) {
  const bsd = leagueConfig.bsd;
  if (!bsd) return [];

  console.log(`\n=== BSD ML Predictions (${leagueConfig.name}) ===`);

  const apiKey = process.env.BSD_API_KEY;
  if (!apiKey) {
    console.log('  [skip] BSD_API_KEY not set. Skipping predictions.');
    return [];
  }

  const resolveTeamKey = makeResolveTeamKey(leagueConfig);

  // Determine BSD league IDs
  const leagueIds = [];
  if (bsd.leagueIdApertura && bsd.leagueIdClausura) {
    leagueIds.push(bsd.leagueIdApertura, bsd.leagueIdClausura);
  } else {
    leagueIds.push(bsd.leagueId);
  }

  const results = [];
  let unmapped = 0;

  for (const lid of leagueIds) {
    const cacheKey = `predictions_${lid}`;
    const { data: predictions, cached } = await fetchBSDPaginated('/api/predictions/', {
      league: lid,
    }, leagueConfig.id, cacheKey, CACHE_TTL_PREDICTIONS);

    if (!predictions || predictions.length === 0) {
      console.log(`  League ${lid}: No predictions available`);
      continue;
    }

    console.log(`  ${cached ? '[cache]' : '[api]'} League ${lid}: ${predictions.length} predictions`);

    for (const pred of predictions) {
      // Predictions have nested event object
      const ev = pred.event || {};
      const homeName = typeof ev.home_team === 'string' ? ev.home_team : (ev.home_team?.name || '');
      const awayName = typeof ev.away_team === 'string' ? ev.away_team : (ev.away_team?.name || '');
      const homeKey = resolveTeamKey(homeName);
      const awayKey = resolveTeamKey(awayName);

      if (!homeKey || !awayKey) {
        unmapped++;
        continue;
      }

      // Filter: only upcoming matches (not finished)
      if (ev.status === 'finished') continue;

      // Probabilities come as percentages (0-100), convert to 0-1
      results.push({
        date: (ev.event_date || '').slice(0, 10),
        homeTeam: homeKey,
        awayTeam: awayKey,
        prob1: (parseFloat(pred.prob_home_win) || 0) / 100,
        probX: (parseFloat(pred.prob_draw) || 0) / 100,
        prob2: (parseFloat(pred.prob_away_win) || 0) / 100,
        probOver25: (parseFloat(pred.prob_over_25) || 0) / 100,
        probBTTS: (parseFloat(pred.prob_btts_yes) || 0) / 100,
        expectedHomeGoals: parseFloat(pred.expected_home_goals) || 0,
        expectedAwayGoals: parseFloat(pred.expected_away_goals) || 0,
        mostLikelyScore: pred.most_likely_score || null,
        confidence: (parseFloat(pred.confidence) || 0) / 100,
        modelVersion: pred.model_version || 'unknown',
        favoriteRecommend: pred.favorite_recommend || false,
        over25Recommend: pred.over_25_recommend || false,
        bttsRecommend: pred.btts_recommend || false,
      });
    }
  }

  console.log(`  Total mapped: ${results.length}, Unmapped: ${unmapped}`);
  return results;
}

/**
 * Utility: Discover team names from BSD for mapping
 */
export async function discoverBSDTeamNames(leagueConfig) {
  const bsd = leagueConfig.bsd;
  if (!bsd) {
    console.log('  BSD not configured for this league');
    return;
  }

  const apiKey = process.env.BSD_API_KEY;
  if (!apiKey) {
    console.log('  BSD_API_KEY not set');
    return;
  }

  console.log(`\n=== Discovering BSD team names for ${leagueConfig.name} ===`);

  const leagueIds = [];
  if (bsd.leagueIdApertura && bsd.leagueIdClausura) {
    leagueIds.push(bsd.leagueIdApertura, bsd.leagueIdClausura);
  } else {
    leagueIds.push(bsd.leagueId);
  }

  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  const teamNames = new Set();

  for (const lid of leagueIds) {
    const today = new Date().toISOString().slice(0, 10);
    const monthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: events } = await fetchBSDPaginated('/api/events/', {
      league: lid,
      date_from: monthsAgo,
      date_to: today,
    }, leagueConfig.id, `discover_${lid}`, 60 * 60 * 1000);

    if (events) {
      for (const ev of events) {
        const home = typeof ev.home_team === 'string' ? ev.home_team : (ev.home_team?.name || '');
        const away = typeof ev.away_team === 'string' ? ev.away_team : (ev.away_team?.name || '');
        if (home) teamNames.add(home);
        if (away) teamNames.add(away);
      }
    }
  }

  if (teamNames.size === 0) {
    console.log('  No events found. Try different date range.');
    return;
  }

  console.log(`  Found ${teamNames.size} teams:\n`);
  const sorted = [...teamNames].sort();
  let unmapped = 0;
  for (const name of sorted) {
    const key = resolveTeamKey(name);
    const status = key ? `→ ${key}` : '→ ??? (UNMAPPED)';
    if (!key) unmapped++;
    console.log(`    ${name} ${status}`);
  }
  console.log(`\n  Mapped: ${sorted.length - unmapped}/${sorted.length}`);
}
