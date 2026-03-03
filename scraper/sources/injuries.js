import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { stripAccents } from '../config.js';

const CACHE_DIR = join(import.meta.dirname, '..', 'cache');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

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

async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true });
}

function cacheFile(leagueId) {
  return join(CACHE_DIR, `apifb_${leagueId}_injuries_current.json`);
}

async function readCachedInjuries(leagueId) {
  const file = cacheFile(leagueId);
  if (!existsSync(file)) return null;
  try {
    const stat = statSync(file);
    if (Date.now() - stat.mtimeMs < CACHE_TTL) {
      return JSON.parse(await readFile(file, 'utf8'));
    }
  } catch { /* cache miss */ }
  return null;
}

async function writeCachedInjuries(leagueId, data) {
  await ensureCacheDir();
  await writeFile(cacheFile(leagueId), JSON.stringify(data), 'utf8');
}

/**
 * Fetch current injuries from API-Football for a league.
 * Uses 1 API request per league. Groups by team.
 * Returns: { teamKey: { count, out: [{ player, type, reason }], lastUpdated } }
 */
export async function fetchInjuries(leagueConfig) {
  const apifb = leagueConfig.apifootball;
  if (!apifb) {
    console.log('\n=== Injuries: Not configured (no API-Football) ===');
    return {};
  }

  console.log(`\n=== Injuries (${leagueConfig.name}) ===`);

  const apiKey = process.env.APIFOOTBALL_KEY;
  if (!apiKey) {
    console.log('  [skip] APIFOOTBALL_KEY not set. Skipping injuries.');
    return {};
  }

  // Check cache
  const cached = await readCachedInjuries(leagueConfig.id);
  if (cached) {
    const count = Object.values(cached).reduce((s, t) => s + t.count, 0);
    console.log(`  [cache] ${Object.keys(cached).length} teams, ${count} total injuries`);
    return cached;
  }

  // Determine current season year
  const now = new Date();
  const season = apifb.seasons[apifb.seasons.length - 1];

  // Fetch injuries from API
  const url = new URL('/injuries', 'https://v3.football.api-sports.io');
  url.searchParams.set('league', apifb.leagueId);
  url.searchParams.set('season', season);

  let data;
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'x-apisports-key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`  [error] API-Football HTTP ${res.status} for injuries`);
      return {};
    }

    const json = await res.json();

    if (json.errors && Object.keys(json.errors).length > 0) {
      console.error(`  [error] API-Football errors:`, json.errors);
      return {};
    }

    data = json.response || [];
  } catch (e) {
    console.error(`  [error] Injuries fetch failed: ${e.message}`);
    return {};
  }

  console.log(`  [api] ${data.length} injury records`);

  // Group by team, filtering only "Missing Fixture" type
  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  const byTeam = {};
  let unmapped = 0;

  for (const entry of data) {
    const teamName = entry.team?.name;
    const teamKey = resolveTeamKey(teamName);
    if (!teamKey) {
      unmapped++;
      continue;
    }

    // Only count players who are missing from the fixture
    const playerType = entry.player?.type || '';
    if (playerType !== 'Missing Fixture') continue;

    if (!byTeam[teamKey]) {
      byTeam[teamKey] = { count: 0, out: [], lastUpdated: new Date().toISOString() };
    }

    byTeam[teamKey].count++;
    byTeam[teamKey].out.push({
      player: entry.player?.name || 'Unknown',
      type: playerType,
      reason: entry.player?.reason || 'Unknown',
    });
  }

  // Cache result
  await writeCachedInjuries(leagueConfig.id, byTeam);

  const teamCount = Object.keys(byTeam).length;
  const totalInjuries = Object.values(byTeam).reduce((s, t) => s + t.count, 0);
  console.log(`  Teams with injuries: ${teamCount}, Total out: ${totalInjuries}`);
  if (unmapped > 0) console.log(`  Unmapped entries: ${unmapped}`);

  return byTeam;
}
