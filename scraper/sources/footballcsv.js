import { buildNameLookup } from '../config.js';

function makeResolveTeamKey(leagueConfig) {
  const nameLookup = buildNameLookup('csv', leagueConfig.teams);
  return function resolveTeamKey(name) {
    if (!name) return null;
    const clean = name.trim();
    const key = nameLookup[clean.toLowerCase()];
    if (key) return key;
    const stripped = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return nameLookup[stripped] || null;
  };
}

function parseScore(ft) {
  if (!ft) return null;
  const m = ft.trim().match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  return { home: parseInt(m[1]), away: parseInt(m[2]) };
}

function parseDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

async function fetchSeason(seasonId, leagueConfig, resolveTeamKey) {
  const csvConfig = leagueConfig.footballcsv;
  const url = `${csvConfig.baseUrl}/${seasonId}/${csvConfig.file}`;
  console.log(`  [fetch] ${url}`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  [warn] HTTP ${res.status} for ${seasonId}`);
      return [];
    }
    const text = await res.text();
    return parseCSV(text, seasonId, resolveTeamKey);
  } catch (e) {
    console.error(`  [error] ${seasonId}: ${e.message}`);
    return [];
  }
}

function parseCSV(text, seasonId, resolveTeamKey) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const idx = {};
  headers.forEach((h, i) => { idx[h] = i; });

  const matches = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = smartSplit(lines[i]);
    if (cols.length < 9) continue;

    const stage = cols[idx['Stage']] || '';
    const round = parseInt(cols[idx['Round']]) || 0;
    const dateStr = cols[idx['Date']] || '';
    const team1 = cols[idx['Team 1']] || '';
    const ft = cols[idx['FT']] || '';
    const team2 = cols[idx['Team 2']] || '';

    const score = parseScore(ft);
    if (!score) continue;

    const date = parseDate(dateStr);
    if (!date) continue;

    const homeKey = resolveTeamKey(team1);
    const awayKey = resolveTeamKey(team2);

    if (!homeKey) {
      console.warn(`  [warn] Unknown CSV team: "${team1}" - add to league config`);
      continue;
    }
    if (!awayKey) {
      console.warn(`  [warn] Unknown CSV team: "${team2}" - add to league config`);
      continue;
    }

    matches.push({
      date,
      jornada: round,
      stage,
      homeTeam: homeKey,
      awayTeam: awayKey,
      homeGoals: score.home,
      awayGoals: score.away,
      seasonId,
      source: 'footballcsv',
    });
  }

  return matches;
}

function smartSplit(line) {
  const cols = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      cols.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cols.push(current.trim());
  return cols;
}

/**
 * Main footballcsv loading function
 * @param {object} leagueConfig — league configuration object
 * @returns {Array} matches
 */
export async function loadFootballCSV(leagueConfig) {
  if (!leagueConfig.footballcsv) {
    console.log('\n=== footballcsv: Not available for this league ===');
    return [];
  }

  console.log('\n=== footballcsv Loader ===');
  const resolveTeamKey = makeResolveTeamKey(leagueConfig);
  const allMatches = [];

  for (const seasonId of leagueConfig.footballcsv.seasons) {
    console.log(`\nSeason: ${seasonId}`);
    const matches = await fetchSeason(seasonId, leagueConfig, resolveTeamKey);
    console.log(`  Found ${matches.length} matches`);
    allMatches.push(...matches);
  }

  console.log(`\nfootballcsv total: ${allMatches.length} matches`);
  return allMatches;
}
