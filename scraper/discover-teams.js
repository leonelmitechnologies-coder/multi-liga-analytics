// Utility to discover teams from ESPN standings API
// Usage: node discover-teams.js --slug eng.1 --id premier-league

import { stripAccents } from './config.js';

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const slug = getArg('slug');
const leagueId = getArg('id') || slug;

if (!slug) {
  console.log('Usage: node discover-teams.js --slug <espn-slug> [--id <league-id>]');
  console.log('');
  console.log('ESPN slugs: mex.1, esp.1, eng.1, ita.1, ger.1, fra.1, etc.');
  console.log('');
  console.log('Example: node discover-teams.js --slug eng.1 --id premier-league');
  process.exit(0);
}

async function discover() {
  console.log(`\n=== Discovering teams for ESPN slug: ${slug} ===\n`);

  const url = `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
  });

  if (!res.ok) {
    console.error(`HTTP ${res.status} — ${res.statusText}`);
    process.exit(1);
  }

  const data = await res.json();
  if (!data.children || !data.children.length) {
    console.error('No standings data found');
    process.exit(1);
  }

  const teams = [];
  for (const group of data.children) {
    const entries = group.standings?.entries || [];
    for (const entry of entries) {
      const displayName = entry.team?.displayName || entry.team?.name || '';
      const abbr = entry.team?.abbreviation || '';
      const color = entry.team?.color ? `#${entry.team.color}` : '#333';
      teams.push({ displayName, abbr, color });
    }
  }

  if (teams.length === 0) {
    console.error('No teams found in standings');
    process.exit(1);
  }

  console.log(`Found ${teams.length} teams:\n`);

  // Generate config skeleton
  console.log('// Paste into scraper/leagues/<league>.js teams: { ... }');
  console.log('');

  for (const t of teams) {
    // Generate key: "Manchester United" → "man_united"
    const key = stripAccents(t.displayName)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      // Shorten common prefixes
      .replace(/^fc_/, '')
      .replace(/_fc$/, '')
      .replace(/^club_/, '')
      .replace(/^real_club_deportivo_/, '')
      .replace(/^sporting_clube_de_/, '');

    const shortName = t.displayName.split(' ').length > 2
      ? t.displayName.split(' ').slice(-1)[0]
      : t.displayName;

    console.log(`    ${key}: {`);
    console.log(`      csv: null, espn: ['${t.displayName}'], apifootball: ['${t.displayName}'],`);
    console.log(`      display: { name: '${t.displayName}', short: '${shortName}', abbr: '${t.abbr}', color: '${t.color}', tc: '#fff' },`);
    console.log(`    },`);
  }
}

discover().catch(e => {
  console.error('[FATAL]', e);
  process.exit(1);
});
