import { writeFile } from 'fs/promises';
import { join } from 'path';
import { loadFootballCSV } from './sources/footballcsv.js';
import { enrichWithESPN, scanESPNDateRange, fetchStandings } from './sources/espn.js';
import { loadAPIFootball, discoverTeamNames } from './sources/apifootball.js';
import { loadBSD, fetchBSDPredictions, discoverBSDTeamNames } from './sources/bsd.js';
import { loadTopScorers } from './sources/footballdata.js';
import { fetchInjuries } from './sources/injuries.js';
import { deduplicateMatches, splitCurrentAndHistorical, determineCutoffDate } from './transform/merge.js';
import { formatSeasonMatches, formatH2HHistory, formatTeams, formatReferees, computeLeagueAverages, enrichWithAverages, formatBSDPredictions, formatInjuries, formatTopScorers } from './transform/format.js';
import { getLeagueConfig, AVAILABLE_LEAGUES } from './config.js';

const DATA_DIR = join(import.meta.dirname, '..', 'data');

async function processLeague(leagueId, args) {
  const leagueConfig = getLeagueConfig(leagueId);
  const skipEspn = args.includes('--skip-espn');
  const skipApifootball = args.includes('--skip-apifootball');
  const skipBsd = args.includes('--skip-bsd');
  const skipFootballdata = args.includes('--skip-footballdata');
  const skipInjuries = args.includes('--skip-injuries');

  console.log(`\n${'╔' + '═'.repeat(54) + '╗'}`);
  console.log(`║   ${leagueConfig.name} Data Scraper`.padEnd(55) + '║');
  console.log(`${'╚' + '═'.repeat(54) + '╝'}`);

  // Step 1: API-Football historical data
  let apifbMatches = [];
  if (!skipApifootball && leagueConfig.apifootball) {
    try {
      apifbMatches = await loadAPIFootball(leagueConfig);
    } catch (e) {
      console.error(`\n[WARN] API-Football loading failed: ${e.message}`);
    }
  }

  // Step 1b: BSD historical data + predictions
  let bsdMatches = [];
  let bsdPredictions = [];
  if (!skipBsd && leagueConfig.bsd) {
    try {
      bsdMatches = await loadBSD(leagueConfig);
    } catch (e) {
      console.error(`\n[WARN] BSD loading failed: ${e.message}`);
    }
    try {
      bsdPredictions = await fetchBSDPredictions(leagueConfig);
    } catch (e) {
      console.error(`\n[WARN] BSD predictions failed: ${e.message}`);
    }
  }

  // Step 2: footballcsv (only for leagues that have it)
  let csvMatches = [];
  if (leagueConfig.footballcsv) {
    try {
      csvMatches = await loadFootballCSV(leagueConfig);
    } catch (e) {
      console.error(`\n[WARN] footballcsv loading failed: ${e.message}`);
    }
  }

  // Step 3: ESPN enrichment of CSV matches
  let espnEnrichedMatches = csvMatches;
  if (!skipEspn && csvMatches.length > 0) {
    try {
      espnEnrichedMatches = await enrichWithESPN(csvMatches, leagueConfig);
    } catch (e) {
      console.error(`\n[WARN] ESPN enrichment failed: ${e.message}`);
    }
  }

  // Step 4: ESPN scan for recent matches
  let espnRecentMatches = [];
  if (!skipEspn) {
    try {
      const latestCsvDate = csvMatches.length > 0
        ? csvMatches.reduce((max, m) => m.date > max ? m.date : max, '2000-01-01')
        : '2024-09-01';
      const scanStart = latestCsvDate;
      const today = new Date().toISOString().slice(0, 10);
      console.log(`\n  Scanning ESPN for matches after ${scanStart}...`);
      espnRecentMatches = await scanESPNDateRange(scanStart, today, leagueConfig);
      console.log(`  ESPN recent matches: ${espnRecentMatches.length}`);
    } catch (e) {
      console.error(`\n[WARN] ESPN scan failed: ${e.message}`);
    }
  }

  // Step 5: Merge all sources and deduplicate
  const combined = [...bsdMatches, ...apifbMatches, ...espnEnrichedMatches, ...espnRecentMatches];
  const allMatches = deduplicateMatches(combined);

  if (allMatches.length === 0) {
    console.error(`\n[ERROR] No matches from any source for ${leagueConfig.name}. Skipping.`);
    return null;
  }

  // Step 6: Fetch real standings from ESPN
  let realStandings = null;
  if (!skipEspn) {
    try {
      realStandings = await fetchStandings(leagueConfig);
    } catch (e) {
      console.error(`\n[WARN] Standings fetch failed: ${e.message}`);
    }
  }

  // Step 6b: Fetch current injuries
  let teamInjuries = {};
  if (!skipInjuries) {
    try {
      teamInjuries = await fetchInjuries(leagueConfig);
    } catch (e) {
      console.error(`\n[WARN] Injuries fetch failed: ${e.message}`);
    }
  }

  // Step 6c: Fetch top scorers from football-data.org
  let topScorersData = [];
  if (!skipFootballdata && leagueConfig.footballdata) {
    try {
      topScorersData = await loadTopScorers(leagueConfig);
    } catch (e) {
      console.error(`\n[WARN] Football-data.org top scorers failed: ${e.message}`);
    }
  }

  // Step 7: Compute league averages
  const matchesWithStats = allMatches.filter(m => m.hasDetailedStats);
  const averages = computeLeagueAverages(matchesWithStats);
  if (averages) {
    console.log('\nLeague averages (from enriched data):');
    console.log(`  Goals/match: ${averages.goalsPerMatch}, Cards/match: ${averages.cardsPerMatch}`);
    console.log(`  Shots/team: ${averages.shotsTotal}, Corners/team: ${averages.corners}`);
  }

  // Step 8: Fill in stats for matches without detailed data
  const enriched = enrichWithAverages(allMatches, averages);

  // Step 9: Split into current season and historical
  const cutoff = determineCutoffDate(enriched, leagueConfig);
  const { current, historical } = splitCurrentAndHistorical(enriched, cutoff);

  // Step 10: Format for the analysis engine
  const TEAMS = formatTeams(leagueConfig);
  const SEASON_MATCHES = formatSeasonMatches(current);
  const H2H_HISTORY = formatH2HHistory(historical);
  const REFEREES = formatReferees([...current, ...historical.slice(0, 200)]);

  // Step 11: Build ESPN names map for frontend live standings
  const espnNames = {};
  for (const [key, team] of Object.entries(leagueConfig.teams)) {
    if (team.espn) espnNames[key] = team.espn;
  }

  // Step 12: Build LEAGUE_META for frontend
  const LEAGUE_META = {
    id: leagueConfig.id,
    name: leagueConfig.name,
    shortName: leagueConfig.shortName,
    espnSlug: leagueConfig.espn.slug,
    tournamentLabel: leagueConfig.tournament.currentLabel,
    standingsTitle: leagueConfig.tournament.standingsTitle,
    standingsZones: leagueConfig.standingsZones,
    espnNames,
    defaultHome: leagueConfig.defaultHome,
    defaultAway: leagueConfig.defaultAway,
  };

  // Step 12b: Format BSD predictions
  const BSD_PREDICTIONS = formatBSDPredictions(bsdPredictions);

  // Step 12c: Format injuries
  const TEAM_INJURIES = formatInjuries(teamInjuries);

  // Step 12d: Format top scorers
  const TOP_SCORERS = formatTopScorers(topScorersData);

  // Step 13: Build metadata
  const sources = [];
  if (bsdMatches.length > 0) sources.push('bsd');
  if (apifbMatches.length > 0) sources.push('api-football');
  if (csvMatches.length > 0) sources.push('footballcsv');
  if (matchesWithStats.length > 0) sources.push('espn.com');
  if (TOP_SCORERS.length > 0) sources.push('football-data.org');

  const META = {
    generated: new Date().toISOString(),
    sources,
    seasonMatches: SEASON_MATCHES.length,
    h2hMatches: H2H_HISTORY.length,
    referees: Object.keys(REFEREES).length,
    cutoffDate: cutoff,
    seasons: [...new Set(allMatches.map(m => m.seasonId).filter(Boolean))],
    enrichedWithStats: matchesWithStats.length,
    fromAPIFootball: apifbMatches.length,
    fromBSD: bsdMatches.length,
    hasBSDPredictions: BSD_PREDICTIONS.length > 0,
    hasInjuries: Object.keys(TEAM_INJURIES).length > 0,
    hasTopScorers: TOP_SCORERS.length > 0,
  };

  // Step 14: Write output
  const outputPath = join(DATA_DIR, leagueConfig.dataFile);
  console.log('\n=== Writing Output ===');
  const output = generateJS(TEAMS, REFEREES, SEASON_MATCHES, H2H_HISTORY, realStandings, LEAGUE_META, META, BSD_PREDICTIONS, TEAM_INJURIES, TOP_SCORERS);
  await writeFile(outputPath, output, 'utf8');
  console.log(`  Written to: ${outputPath}`);
  console.log(`  File size: ${(Buffer.byteLength(output) / 1024).toFixed(1)} KB`);

  // Summary
  const w = 54;
  console.log('\n' + '═'.repeat(w));
  console.log(`  ${leagueConfig.name} SUMMARY`);
  console.log('═'.repeat(w));
  console.log(`  Teams:              ${Object.keys(TEAMS).length}`);
  console.log(`  Referees:           ${Object.keys(REFEREES).length}`);
  console.log(`  Season matches:     ${SEASON_MATCHES.length}`);
  console.log(`  H2H history:        ${H2H_HISTORY.length}`);
  console.log(`  With detailed stats:${matchesWithStats.length}`);
  console.log(`  From API-Football:  ${apifbMatches.length}`);
  console.log(`  From BSD:           ${bsdMatches.length}`);
  console.log(`  BSD predictions:    ${BSD_PREDICTIONS.length}`);
  console.log(`  Real standings:     ${realStandings ? 'YES' : 'NO'}`);
  const injuryTotal = Object.values(TEAM_INJURIES).reduce((s, t) => s + t.count, 0);
  console.log(`  Injuries:           ${Object.keys(TEAM_INJURIES).length} teams, ${injuryTotal} players out`);
  console.log(`  Top scorers:        ${TOP_SCORERS.length}`);
  console.log(`  Sources:            ${META.sources.join(', ')}`);
  console.log('═'.repeat(w));

  return { leagueId, success: true };
}

function generateJS(teams, referees, seasonMatches, h2hHistory, standings, leagueMeta, meta, bsdPredictions, teamInjuries, topScorers) {
  const j = (obj) => JSON.stringify(obj, null, 2);

  return `// ${leagueMeta.name} Analytics - Real Data
// Auto-generated by scraper on ${meta.generated}
// Sources: ${meta.sources.join(', ')}
// Matches: ${meta.seasonMatches} season + ${meta.h2hMatches} historical
// Enriched matches with stats: ${meta.enrichedWithStats}
// BSD predictions: ${(bsdPredictions || []).length}

var TEAMS = ${j(teams)};

var REFEREES = ${j(referees)};

var SEASON_MATCHES = ${j(seasonMatches)};

var H2H_HISTORY = ${j(h2hHistory)};

${standings ? `var REAL_STANDINGS = ${j(standings)};` : 'var REAL_STANDINGS = null;'}

var DATA_META = ${j(meta)};

var LEAGUE_META = ${j(leagueMeta)};

var BSD_PREDICTIONS = ${j(bsdPredictions || [])};

var TEAM_INJURIES = ${j(teamInjuries || {})};

var TOP_SCORERS = ${j(topScorers || [])};
`;
}

async function main() {
  const args = process.argv.slice(2);
  const discoverNames = args.includes('--discover-teams');
  const discoverBSD = args.includes('--discover-bsd-teams');

  // Parse --league argument
  let leagueArg = 'liga-mx'; // default
  const leagueIdx = args.indexOf('--league');
  if (leagueIdx !== -1 && args[leagueIdx + 1]) {
    leagueArg = args[leagueIdx + 1];
  }

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   Multi-League Data Scraper v5.0                     ║');
  console.log('║   Sources: BSD + API-Football + footballcsv + ESPN    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`Time: ${new Date().toISOString()}`);

  // Utility: discover team names
  if (discoverNames) {
    const config = getLeagueConfig(leagueArg);
    await discoverTeamNames(config);
    return;
  }

  // Utility: discover BSD team names
  if (discoverBSD) {
    const config = getLeagueConfig(leagueArg);
    await discoverBSDTeamNames(config);
    return;
  }

  // Determine which leagues to process
  let leagueIds;
  if (leagueArg === 'all') {
    leagueIds = [...AVAILABLE_LEAGUES];
  } else {
    leagueIds = [leagueArg];
  }

  console.log(`Leagues: ${leagueIds.join(', ')}\n`);

  const results = [];
  for (const id of leagueIds) {
    try {
      const result = await processLeague(id, args);
      if (result) results.push(result);
    } catch (e) {
      console.error(`\n[ERROR] Failed to process ${id}: ${e.message}`);
      console.error(e.stack);
    }
  }

  console.log(`\n${'═'.repeat(54)}`);
  console.log(`  ALL DONE — ${results.length}/${leagueIds.length} leagues processed`);
  console.log('═'.repeat(54));
}

main().catch(e => {
  console.error('\n[FATAL]', e);
  process.exit(1);
});
