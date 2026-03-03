import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { buildNameLookup, stripAccents } from '../config.js';

const CACHE_DIR = join(import.meta.dirname, '..', 'cache');
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for completed matches
const REQUEST_DELAY = 800; // ms between requests

function buildEspnLookup(leagueConfig) {
  const lookup = {};
  for (const [key, team] of Object.entries(leagueConfig.teams)) {
    const names = team.espn;
    if (!names) continue;
    for (const name of names) {
      lookup[name.toLowerCase()] = key;
      lookup[stripAccents(name).toLowerCase()] = key;
    }
  }
  return lookup;
}

function makeResolveTeamKey(leagueConfig) {
  const espnNameLookup = buildEspnLookup(leagueConfig);
  return function resolveTeamKey(name) {
    if (!name) return null;
    const clean = name.trim();
    let key = espnNameLookup[clean.toLowerCase()];
    if (key) return key;
    key = espnNameLookup[stripAccents(clean).toLowerCase()];
    if (key) return key;
    // Fuzzy: check if any known name is contained
    for (const [k, team] of Object.entries(leagueConfig.teams)) {
      const names = team.espn;
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
  return join(CACHE_DIR, `espn_${leagueId}_${key}.json`);
}

async function fetchJSON(url, leagueId, cacheKey, ttl = CACHE_TTL) {
  await ensureCacheDir();
  const file = cacheFile(leagueId, cacheKey);

  // Check cache
  if (existsSync(file)) {
    try {
      const { statSync } = await import('fs');
      const stat = statSync(file);
      if (Date.now() - stat.mtimeMs < ttl) {
        const data = JSON.parse(await readFile(file, 'utf8'));
        return { data, cached: true };
      }
    } catch { /* cache miss */ }
  }

  // Rate limit only on actual network requests
  await delay(REQUEST_DELAY);

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  if (!res.ok) {
    console.error(`  [error] ESPN HTTP ${res.status} for ${url.slice(0, 80)}`);
    return { data: null, cached: false };
  }

  const data = await res.json();
  await writeFile(file, JSON.stringify(data), 'utf8');
  return { data, cached: false };
}

function getBaseUrl(leagueConfig) {
  return `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueConfig.espn.slug}`;
}

/**
 * Get all match event IDs for a specific date
 */
async function getScoreboardForDate(leagueConfig, dateStr) {
  const espnDate = dateStr.replace(/-/g, '');
  const cacheKey = `scoreboard_${espnDate}`;
  const url = `${getBaseUrl(leagueConfig)}/scoreboard?dates=${espnDate}&limit=20`;
  const { data } = await fetchJSON(url, leagueConfig.id, cacheKey);
  return data;
}

/**
 * Get detailed match statistics for a specific event
 */
async function getMatchSummary(leagueConfig, eventId) {
  const cacheKey = `summary_${eventId}`;
  const url = `${getBaseUrl(leagueConfig)}/summary?event=${eventId}`;
  const { data } = await fetchJSON(url, leagueConfig.id, cacheKey);
  return data;
}

/**
 * Parse team stats from ESPN summary response
 */
function parseTeamStats(statistics) {
  if (!statistics || !Array.isArray(statistics)) return null;

  const stats = {};
  for (const item of statistics) {
    const name = (item.name || '').toLowerCase();
    const label = (item.label || '').toLowerCase();
    const val = item.displayValue || String(item.value || '0');
    if (name) stats[name] = val;
    if (label) stats[label] = val;
  }

  return {
    possession: parseFloat(stats['possessionpct'] || stats['possession'] || stats['ball possession'] || '50') || 50,
    shotsTotal: parseInt(stats['totalshots'] || stats['shots'] || stats['total shots'] || '0') || 0,
    shotsOnTarget: parseInt(stats['shotsontarget'] || stats['shotsongoal'] || stats['shots on target'] || stats['shots on goal'] || '0') || 0,
    corners: parseInt(stats['cornerkicks'] || stats['corner kicks'] || stats['corners'] || '0') || 0,
    fouls: parseInt(stats['foulscommitted'] || stats['fouls committed'] || stats['fouls'] || '0') || 0,
    yellowCards: parseInt(stats['yellowcards'] || stats['yellow cards'] || '0') || 0,
    redCards: parseInt(stats['redcards'] || stats['red cards'] || '0') || 0,
    offsides: parseInt(stats['offsides'] || '0') || 0,
    saves: parseInt(stats['saves'] || '0') || 0,
  };
}

/**
 * Enrich footballcsv matches with ESPN detailed stats
 */
export async function enrichWithESPN(csvMatches, leagueConfig, options = {}) {
  console.log('\n=== ESPN Stats Enrichment ===');

  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  const { maxMatches = Infinity } = options;

  const byDate = new Map();
  for (const m of csvMatches) {
    if (!byDate.has(m.date)) byDate.set(m.date, []);
    byDate.get(m.date).push(m);
  }

  const uniqueDates = [...byDate.keys()].sort();
  console.log(`  Unique dates to query: ${uniqueDates.length}`);

  let enriched = 0;
  let notFound = 0;
  let errors = 0;
  let processed = 0;

  const eventMap = new Map();

  console.log('  Phase 1: Fetching scoreboards...');
  for (const date of uniqueDates) {
    if (processed >= maxMatches) break;

    try {
      const scoreboard = await getScoreboardForDate(leagueConfig, date);
      if (!scoreboard || !scoreboard.events) {
        continue;
      }

      for (const event of scoreboard.events) {
        if (!event.competitions || !event.competitions[0]) continue;
        const comp = event.competitions[0];
        const competitors = comp.competitors || [];

        let homeKey = null, awayKey = null;
        for (const c of competitors) {
          const teamName = c.team?.displayName || c.team?.name || '';
          const key = resolveTeamKey(teamName);
          if (c.homeAway === 'home') homeKey = key;
          else awayKey = key;
        }

        if (homeKey && awayKey) {
          const matchKey = `${date}|${homeKey}|${awayKey}`;
          eventMap.set(matchKey, event.id);
        }
      }
    } catch (e) {
      errors++;
    }

    processed += byDate.get(date).length;

    if (uniqueDates.indexOf(date) % 20 === 0) {
      console.log(`    Progress: ${uniqueDates.indexOf(date)}/${uniqueDates.length} dates`);
    }
  }

  console.log(`  Found ${eventMap.size} event IDs`);

  console.log('  Phase 2: Fetching match summaries...');
  const statsMap = new Map();

  let summaryCount = 0;
  for (const [matchKey, eventId] of eventMap) {
    try {
      const summary = await getMatchSummary(leagueConfig, eventId);
      if (!summary) continue;

      const boxscore = summary.boxscore;
      if (!boxscore || !boxscore.teams) continue;

      const teams = boxscore.teams;
      let homeStats = null, awayStats = null;

      for (const team of teams) {
        const teamStats = team.statistics || [];
        const parsed = parseTeamStats(teamStats);
        if (!parsed) continue;

        if (team.homeAway === 'home') homeStats = parsed;
        else awayStats = parsed;
      }

      if (homeStats && awayStats) {
        homeStats.freeKicks = awayStats.fouls || homeStats.fouls || 0;
        awayStats.freeKicks = homeStats.fouls || awayStats.fouls || 0;
        homeStats.xG = 0;
        awayStats.xG = 0;
        homeStats.firstGoalMinute = null;
        awayStats.firstGoalMinute = null;

        statsMap.set(matchKey, { homeStats, awayStats });
      }
    } catch (e) {
      errors++;
    }

    summaryCount++;
    if (summaryCount % 50 === 0) {
      console.log(`    Progress: ${summaryCount}/${eventMap.size} summaries`);
    }
  }

  console.log(`  Got detailed stats for ${statsMap.size} matches`);

  const result = csvMatches.map(m => {
    const matchKey = `${m.date}|${m.homeTeam}|${m.awayTeam}`;
    const stats = statsMap.get(matchKey);

    if (stats) {
      enriched++;
      return {
        ...m,
        homeStats: stats.homeStats,
        awayStats: stats.awayStats,
        hasDetailedStats: true,
        source: 'footballcsv+espn',
      };
    }

    notFound++;
    return m;
  });

  console.log(`\n  ESPN enrichment summary:`);
  console.log(`    Enriched: ${enriched}`);
  console.log(`    Not found: ${notFound}`);
  console.log(`    Errors: ${errors}`);

  return result;
}

/**
 * Scan ESPN for matches in a date range (independent of footballcsv)
 */
export async function scanESPNDateRange(startDate, endDate, leagueConfig) {
  console.log(`\n=== ESPN Date Range Scan: ${startDate} to ${endDate} ===`);

  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  const matches = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  let daysScanned = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const espnDate = dateStr.replace(/-/g, '');

    try {
      const { data: scoreboard } = await fetchJSON(
        `${getBaseUrl(leagueConfig)}/scoreboard?dates=${espnDate}&limit=20`,
        leagueConfig.id,
        `scoreboard_${espnDate}`
      );

      if (!scoreboard || !scoreboard.events) {
        daysScanned++;
        continue;
      }

      for (const event of scoreboard.events) {
        if (!event.competitions || !event.competitions[0]) continue;
        const comp = event.competitions[0];
        const competitors = comp.competitors || [];

        if (comp.status?.type?.completed !== true) continue;

        let homeKey = null, awayKey = null;
        let homeScore = 0, awayScore = 0;
        for (const c of competitors) {
          const teamName = c.team?.displayName || c.team?.name || '';
          const key = resolveTeamKey(teamName);
          const score = parseInt(c.score) || 0;
          if (c.homeAway === 'home') { homeKey = key; homeScore = score; }
          else { awayKey = key; awayScore = score; }
        }

        if (homeKey && awayKey) {
          matches.push({
            date: dateStr,
            eventId: event.id,
            homeTeam: homeKey,
            awayTeam: awayKey,
            homeGoals: homeScore,
            awayGoals: awayScore,
            source: 'espn',
          });
        }
      }
    } catch (e) { /* skip */ }

    daysScanned++;
    if (daysScanned % 30 === 0) {
      console.log(`  Scanned ${daysScanned}/${totalDays} days, found ${matches.length} matches`);
    }
  }

  console.log(`  Scan complete: ${matches.length} matches found in ${daysScanned} days`);

  if (matches.length > 0) {
    console.log(`  Fetching detailed stats for ${matches.length} matches...`);
    let enrichedCount = 0;

    for (const m of matches) {
      try {
        const summary = await getMatchSummary(leagueConfig, m.eventId);
        if (!summary || !summary.boxscore || !summary.boxscore.teams) continue;

        let homeStats = null, awayStats = null;
        for (const team of summary.boxscore.teams) {
          const parsed = parseTeamStats(team.statistics || []);
          if (!parsed) continue;
          if (team.homeAway === 'home') homeStats = parsed;
          else awayStats = parsed;
        }

        if (homeStats && awayStats) {
          homeStats.freeKicks = awayStats.fouls || 0;
          awayStats.freeKicks = homeStats.fouls || 0;
          homeStats.xG = 0;
          awayStats.xG = 0;
          homeStats.firstGoalMinute = null;
          awayStats.firstGoalMinute = null;
          m.homeStats = homeStats;
          m.awayStats = awayStats;
          m.hasDetailedStats = true;
          enrichedCount++;
        }
      } catch (e) { /* skip */ }

      if (enrichedCount % 30 === 0 && enrichedCount > 0) {
        console.log(`    ${enrichedCount} matches enriched`);
      }
    }

    console.log(`  Enriched ${enrichedCount}/${matches.length} matches with stats`);
  }

  return matches;
}

/**
 * Fetch current standings from ESPN API
 */
export async function fetchStandings(leagueConfig) {
  console.log('\n=== ESPN Standings ===');
  const url = `https://site.api.espn.com/apis/v2/sports/soccer/${leagueConfig.espn.slug}/standings`;
  const { data } = await fetchJSON(url, leagueConfig.id, 'standings_current', 6 * 60 * 60 * 1000);
  if (!data || !data.children) {
    console.log('  No standings data available');
    return null;
  }

  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  const standings = [];
  for (const group of data.children) {
    const entries = group.standings?.entries || [];
    for (const entry of entries) {
      const teamName = entry.team?.displayName || entry.team?.name || '';
      const key = resolveTeamKey(teamName);
      if (!key) continue;

      const stats = {};
      for (const s of (entry.stats || [])) {
        stats[s.name || s.abbreviation || ''] = s.value ?? s.displayValue ?? 0;
      }

      standings.push({
        id: key,
        rank: parseInt(stats['rank'] || stats['playoffSeed'] || 0),
        mp: parseInt(stats['gamesPlayed'] || 0),
        w: parseInt(stats['wins'] || 0),
        d: parseInt(stats['ties'] || stats['draws'] || 0),
        l: parseInt(stats['losses'] || 0),
        gf: parseInt(stats['pointsFor'] || stats['goalsFor'] || 0),
        ga: parseInt(stats['pointsAgainst'] || stats['goalsAgainst'] || 0),
        gd: parseInt(stats['pointDifferential'] || stats['goalDifference'] || 0),
        pts: parseInt(stats['points'] || 0),
      });
    }
  }

  standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  console.log(`  Found ${standings.length} teams in standings`);
  return standings;
}
