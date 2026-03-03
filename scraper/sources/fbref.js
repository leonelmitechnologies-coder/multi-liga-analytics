import * as cheerio from 'cheerio';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { FBREF, buildNameLookup } from '../config.js';

const nameLookup = buildNameLookup('fbref');
const CACHE_DIR = join(import.meta.dirname, '..', 'cache');

async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true });
}

function cacheKey(url) {
  // Simple hash for cache filename
  let h = 0;
  for (let i = 0; i < url.length; i++) h = ((h << 5) - h + url.charCodeAt(i)) | 0;
  return `fbref_${Math.abs(h).toString(36)}.html`;
}

async function fetchWithCache(url) {
  await ensureCacheDir();
  const file = join(CACHE_DIR, cacheKey(url));

  // Check cache
  if (existsSync(file)) {
    try {
      const stat = await import('fs').then(fs => fs.statSync(file));
      if (Date.now() - stat.mtimeMs < FBREF.cacheTTL) {
        console.log(`  [cache] ${url.slice(0, 80)}...`);
        return await readFile(file, 'utf8');
      }
    } catch { /* cache miss */ }
  }

  // Fetch with proper headers
  console.log(`  [fetch] ${url.slice(0, 80)}...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': FBREF.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    },
  });

  if (!res.ok) {
    console.error(`  [error] HTTP ${res.status} for ${url}`);
    return null;
  }

  const html = await res.text();
  await writeFile(file, html, 'utf8');
  return html;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// FBref wraps some tables in HTML comments. Uncomment them.
function uncommentTables(html) {
  return html.replace(/<!--\s*(<div[^>]*>[\s\S]*?<\/div>)\s*-->/g, '$1');
}

function resolveTeamKey(name) {
  if (!name) return null;
  const clean = name.trim();
  const key = nameLookup[clean.toLowerCase()];
  if (key) return key;
  // Try without accents
  const stripped = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return nameLookup[stripped] || null;
}

/**
 * Scrape the league page to discover team squad IDs
 */
export async function discoverTeams(seasonId) {
  const url = seasonId
    ? `${FBREF.baseUrl}/en/comps/${FBREF.compId}/${seasonId}/${seasonId}-${FBREF.compName}-Stats`
    : `${FBREF.baseUrl}/en/comps/${FBREF.compId}/${FBREF.compName}-Stats`;

  const html = await fetchWithCache(url);
  if (!html) return [];

  const $ = cheerio.load(uncommentTables(html));
  const teams = [];

  // Look for the overall stats table with team links
  $('table tbody tr').each((_, row) => {
    const link = $(row).find('td[data-stat="team"] a, th[data-stat="team"] a').first();
    if (!link.length) return;

    const href = link.attr('href');
    const name = link.text().trim();
    if (!href || !name) return;

    // Extract squad ID from href like /en/squads/SQUAD_ID/...
    const match = href.match(/\/squads\/([a-f0-9]+)\//);
    if (!match) return;

    const key = resolveTeamKey(name);
    if (key) {
      teams.push({ key, name, squadId: match[1] });
    } else {
      console.warn(`  [warn] Unknown team: "${name}" - add to config.js TEAM_MAP`);
    }
  });

  // Deduplicate
  const seen = new Set();
  return teams.filter(t => {
    if (seen.has(t.key)) return false;
    seen.add(t.key);
    return true;
  });
}

/**
 * Scrape the full scores/fixtures table for a season
 * This is more efficient than per-team scraping: one page has all matches
 */
export async function scrapeScoresAndFixtures(seasonId) {
  const url = seasonId
    ? `${FBREF.baseUrl}/en/comps/${FBREF.compId}/${seasonId}/schedule/${seasonId}-${FBREF.compName}-Scores-and-Fixtures`
    : `${FBREF.baseUrl}/en/comps/${FBREF.compId}/schedule/${FBREF.compName}-Scores-and-Fixtures`;

  const html = await fetchWithCache(url);
  if (!html) return [];

  const $ = cheerio.load(uncommentTables(html));
  const matches = [];

  $('table#sched_all tbody tr, table#sched_ks_all tbody tr, table[id*="sched"] tbody tr').each((_, row) => {
    const $r = $(row);
    // Skip spacer rows
    if ($r.hasClass('spacer') || $r.hasClass('thead') || $r.find('th[colspan]').length) return;

    const date = $r.find('td[data-stat="date"], th[data-stat="date"]').text().trim();
    if (!date) return;

    const homeTeamName = $r.find('td[data-stat="home_team"] a, td[data-stat="squad_a"] a').text().trim() ||
                         $r.find('td[data-stat="home_team"], td[data-stat="squad_a"]').text().trim();
    const awayTeamName = $r.find('td[data-stat="away_team"] a, td[data-stat="squad_b"] a').text().trim() ||
                         $r.find('td[data-stat="away_team"], td[data-stat="squad_b"]').text().trim();
    const scoreText = $r.find('td[data-stat="score"] a, td[data-stat="score"]').text().trim();
    const round = $r.find('td[data-stat="round"], th[data-stat="round"]').text().trim();
    const referee = $r.find('td[data-stat="referee"]').text().trim();
    const venue = $r.find('td[data-stat="venue"]').text().trim();
    const xgHome = parseFloat($r.find('td[data-stat="home_xg"], td[data-stat="xg_a"]').text()) || 0;
    const xgAway = parseFloat($r.find('td[data-stat="away_xg"], td[data-stat="xg_b"]').text()) || 0;

    if (!homeTeamName || !awayTeamName) return;

    const homeKey = resolveTeamKey(homeTeamName);
    const awayKey = resolveTeamKey(awayTeamName);

    // Parse score
    let homeGoals = null, awayGoals = null;
    const scoreMatch = scoreText.match(/(\d+)\s*[–\-:]\s*(\d+)/);
    if (scoreMatch) {
      homeGoals = parseInt(scoreMatch[1]);
      awayGoals = parseInt(scoreMatch[2]);
    }

    // Parse round/jornada
    let jornada = 0;
    const roundMatch = round.match(/(\d+)/);
    if (roundMatch) jornada = parseInt(roundMatch[1]);

    matches.push({
      date,
      jornada,
      homeTeam: homeKey,
      homeTeamName,
      awayTeam: awayKey,
      awayTeamName,
      homeGoals,
      awayGoals,
      referee: referee || null,
      venue: venue || null,
      xgHome,
      xgAway,
      seasonId: seasonId || 'current',
    });
  });

  return matches.filter(m => m.homeTeam && m.awayTeam && m.homeGoals !== null);
}

/**
 * Scrape team match logs for detailed stats (shooting, misc, possession)
 */
export async function scrapeTeamMatchLogs(squadId, teamName, seasonId, type) {
  // type: 'shooting', 'misc', 'keeper', 'passing_types'
  const seasonPath = seasonId ? `${seasonId}/` : '';
  const url = `${FBREF.baseUrl}/en/squads/${squadId}/matchlogs/${seasonPath}c${FBREF.compId}/${type}/${teamName}-Match-Logs-${FBREF.compName}`;

  const html = await fetchWithCache(url);
  if (!html) return [];

  const $ = cheerio.load(uncommentTables(html));
  const rows = [];

  $('table#matchlogs_for tbody tr, table[id*="matchlogs"] tbody tr').each((_, row) => {
    const $r = $(row);
    if ($r.hasClass('spacer') || $r.hasClass('thead') || $r.find('th[colspan]').length) return;

    const date = $r.find('th[data-stat="date"], td[data-stat="date"]').text().trim();
    if (!date) return;

    const opponent = $r.find('td[data-stat="opponent"] a, td[data-stat="opponent"]').text().trim();
    const venue = $r.find('td[data-stat="venue"]').text().trim();

    const stats = {};
    // Extract all data-stat values from the row
    $r.find('td[data-stat], th[data-stat]').each((_, cell) => {
      const stat = $(cell).attr('data-stat');
      const val = $(cell).text().trim();
      stats[stat] = val;
    });

    rows.push({ date, opponent, venue, stats });
  });

  return rows;
}

/**
 * Main FBref scraping function - scrapes all available data for specified seasons
 */
export async function scrapeFBref(seasons) {
  console.log('\n=== FBref Scraper ===');
  const allMatches = [];
  const detailedStats = new Map(); // key: "date|homeKey|awayKey" → stats

  for (const season of seasons) {
    console.log(`\nSeason: ${season.label} (${season.id})`);

    // Step 1: Get scores and fixtures
    console.log('  Fetching scores and fixtures...');
    const matches = await scrapeScoresAndFixtures(season.id);
    console.log(`  Found ${matches.length} matches`);
    await delay(FBREF.requestDelay);

    if (matches.length === 0) {
      console.log('  Skipping this season (no data)');
      continue;
    }

    allMatches.push(...matches);

    // Step 2: Discover teams for this season
    console.log('  Discovering teams...');
    const teams = await discoverTeams(season.id);
    console.log(`  Found ${teams.length} teams`);
    await delay(FBREF.requestDelay);

    // Step 3: For each team, get detailed match logs
    for (const team of teams) {
      for (const logType of ['shooting', 'misc']) {
        console.log(`  ${team.name} - ${logType}...`);
        try {
          const logs = await scrapeTeamMatchLogs(
            team.squadId,
            team.name.replace(/\s+/g, '-'),
            season.id,
            logType
          );

          // Index logs by date for joining
          for (const log of logs) {
            const opponentKey = resolveTeamKey(log.opponent);
            const isHome = log.venue === 'Home';
            const matchKey = `${log.date}|${isHome ? team.key : opponentKey}|${isHome ? opponentKey : team.key}`;

            if (!detailedStats.has(matchKey)) {
              detailedStats.set(matchKey, { home: {}, away: {} });
            }
            const side = isHome ? 'home' : 'away';
            Object.assign(detailedStats.get(matchKey)[side], parseLogStats(logType, log.stats));
          }
        } catch (e) {
          console.error(`  [error] ${team.name} ${logType}: ${e.message}`);
        }
        await delay(FBREF.requestDelay);
      }
    }
  }

  // Step 4: Merge basic match data with detailed stats
  const enrichedMatches = allMatches.map(m => {
    const key = `${m.date}|${m.homeTeam}|${m.awayTeam}`;
    const detail = detailedStats.get(key) || { home: {}, away: {} };

    return {
      ...m,
      homeStats: {
        possession: detail.home.possession || 50,
        shotsTotal: detail.home.shots || 0,
        shotsOnTarget: detail.home.shotsOnTarget || 0,
        corners: detail.home.corners || 0,
        fouls: detail.home.fouls || 0,
        yellowCards: detail.home.yellowCards || 0,
        redCards: detail.home.redCards || 0,
        offsides: detail.home.offsides || 0,
        freeKicks: detail.away.fouls || detail.home.fouls || 0, // free kicks ≈ opponent fouls
        xG: m.xgHome || detail.home.xG || 0,
        firstGoalMinute: null,
      },
      awayStats: {
        possession: detail.away.possession || 50,
        shotsTotal: detail.away.shots || 0,
        shotsOnTarget: detail.away.shotsOnTarget || 0,
        corners: detail.away.corners || 0,
        fouls: detail.away.fouls || 0,
        yellowCards: detail.away.yellowCards || 0,
        redCards: detail.away.redCards || 0,
        offsides: detail.away.offsides || 0,
        freeKicks: detail.home.fouls || detail.away.fouls || 0,
        xG: m.xgAway || detail.away.xG || 0,
        firstGoalMinute: null,
      },
    };
  });

  console.log(`\nFBref total: ${enrichedMatches.length} matches`);
  return enrichedMatches;
}

/**
 * Parse stat values from a match log row based on log type
 */
function parseLogStats(type, stats) {
  const num = (v) => parseFloat(v) || 0;

  if (type === 'shooting') {
    return {
      shots: num(stats.shots) || num(stats.sh),
      shotsOnTarget: num(stats.shots_on_target) || num(stats.sot),
      xG: num(stats.xg) || num(stats.xg_expected),
    };
  }

  if (type === 'misc') {
    return {
      fouls: num(stats.fouls) || num(stats.fls),
      yellowCards: num(stats.cards_yellow) || num(stats.crdy),
      redCards: num(stats.cards_red) || num(stats.crdr),
      offsides: num(stats.offsides) || num(stats.off),
      corners: num(stats.corner_kicks) || num(stats.ck),
      possession: num(stats.poss) || 0,
    };
  }

  return {};
}
