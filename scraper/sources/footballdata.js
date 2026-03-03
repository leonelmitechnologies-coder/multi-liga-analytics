import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { buildNameLookup, stripAccents } from '../config.js';

const CACHE_DIR = join(import.meta.dirname, '..', 'cache');
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const BASE_URL = 'https://api.football-data.org/v4';

async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true });
}

function cacheFile(leagueId) {
  return join(CACHE_DIR, `fd_${leagueId}_scorers.json`);
}

async function readCache(leagueId) {
  const file = cacheFile(leagueId);
  if (!existsSync(file)) return null;
  try {
    const stat = statSync(file);
    const age = Date.now() - stat.mtimeMs;
    if (age > CACHE_TTL) return null; // expired
    return JSON.parse(await readFile(file, 'utf8'));
  } catch { return null; }
}

async function writeCache(leagueId, data) {
  await ensureCacheDir();
  await writeFile(cacheFile(leagueId), JSON.stringify(data, null, 2), 'utf8');
}

function makeResolveTeamKey(leagueConfig) {
  const lookup = buildNameLookup('footballdata', leagueConfig.teams);
  return function resolveTeamKey(name) {
    if (!name) return null;
    const clean = name.trim();
    let key = lookup[clean.toLowerCase()];
    if (key) return key;
    key = lookup[stripAccents(clean).toLowerCase()];
    if (key) return key;
    // Fuzzy: check if any known name is contained
    for (const [k, team] of Object.entries(leagueConfig.teams)) {
      const names = team.footballdata;
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

/**
 * Fetch top scorers from football-data.org API v4
 */
export async function loadTopScorers(leagueConfig) {
  const fd = leagueConfig.footballdata;
  if (!fd) {
    console.log('\n=== Football-Data.org: Not configured for this league ===');
    return [];
  }

  console.log(`\n=== Football-Data.org Top Scorers (${leagueConfig.name}) ===`);

  const apiKey = process.env.FD_API_KEY;
  if (!apiKey) {
    console.log('  [skip] FD_API_KEY not set. Skipping football-data.org source.');
    return [];
  }

  // Check cache first
  const cached = await readCache(leagueConfig.id);
  if (cached) {
    console.log(`  [cache] Using cached scorers (${cached.length} players)`);
    return cached;
  }

  // Fetch from API
  const url = `${BASE_URL}/competitions/${fd.competitionCode}/scorers?limit=25`;
  console.log(`  Fetching ${url}...`);

  let data;
  try {
    const res = await fetch(url, {
      headers: {
        'X-Auth-Token': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`  [error] football-data.org HTTP ${res.status}: ${res.statusText}`);
      // Try stale cache as fallback
      const stale = await readStaleCache(leagueConfig.id);
      if (stale) {
        console.log(`  [fallback] Using stale cache (${stale.length} players)`);
        return stale;
      }
      return [];
    }

    data = await res.json();
  } catch (e) {
    console.error(`  [error] football-data.org fetch failed: ${e.message}`);
    const stale = await readStaleCache(leagueConfig.id);
    if (stale) {
      console.log(`  [fallback] Using stale cache (${stale.length} players)`);
      return stale;
    }
    return [];
  }

  const scorers = data.scorers || [];
  console.log(`  [api] Got ${scorers.length} scorers`);

  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  const unmappedTeams = new Set();

  const result = scorers.map(s => {
    const teamName = s.team?.shortName || s.team?.name || '';
    const teamKey = resolveTeamKey(teamName);
    if (!teamKey) unmappedTeams.add(teamName);

    return {
      playerName: s.player?.name || 'Unknown',
      teamKey: teamKey,
      teamName: teamName,
      goals: s.goals || 0,
      assists: s.assists || 0,
      penalties: s.penalties || 0,
      played: s.playedMatches || 0,
    };
  }).filter(s => s.teamKey); // Only keep scorers with resolved teams

  if (unmappedTeams.size > 0) {
    console.log(`  [!] Unmapped teams: ${[...unmappedTeams].join(', ')}`);
    console.log(`      Add these to league config teams.*.footballdata`);
  }

  // Cache the result
  await writeCache(leagueConfig.id, result);
  console.log(`  Top scorers: ${result.length} players cached`);

  return result;
}

/**
 * Read stale cache (ignoring TTL) as fallback on API error
 */
async function readStaleCache(leagueId) {
  const file = cacheFile(leagueId);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch { return null; }
}
