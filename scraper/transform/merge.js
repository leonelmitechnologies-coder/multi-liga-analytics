import { normalizeRefereeName, validateMatch } from './normalize.js';

/**
 * Merge matches from FBref and footballcsv sources
 */
export function mergeMatches(fbrefMatches, csvMatches) {
  console.log('\n=== Merging Data ===');

  const fbrefIndex = new Map();
  for (const m of fbrefMatches) {
    const key = dedupeKey(m);
    fbrefIndex.set(key, m);
  }

  const merged = [...fbrefMatches];
  let csvAdded = 0, csvDuplicates = 0;

  for (const m of csvMatches) {
    const key = dedupeKey(m);
    if (fbrefIndex.has(key)) {
      csvDuplicates++;
      continue;
    }
    merged.push({
      ...m,
      source: 'footballcsv',
      hasDetailedStats: false,
    });
    csvAdded++;
  }

  merged.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`  FBref matches: ${fbrefMatches.length}`);
  console.log(`  CSV matches added: ${csvAdded}`);
  console.log(`  CSV duplicates skipped: ${csvDuplicates}`);
  console.log(`  Total merged: ${merged.length}`);

  return merged;
}

function dedupeKey(m) {
  const teams = [m.homeTeam, m.awayTeam].sort();
  return `${m.date}|${teams[0]}|${teams[1]}`;
}

/**
 * Deduplicate matches from multiple sources
 */
export function deduplicateMatches(matches) {
  console.log('\n=== Deduplicating Matches ===');
  console.log(`  Input: ${matches.length} matches`);

  const SOURCE_PRIORITY = {
    'bsd+predictions': 6,
    'bsd': 5,
    'apifootball+stats': 4,
    'apifootball': 3,
    'footballcsv+espn': 3,
    'espn': 2,
    'footballcsv': 1,
  };

  const index = new Map();
  let dupes = 0;

  for (const m of matches) {
    const key = dedupeKey(m);
    const existing = index.get(key);

    if (!existing) {
      index.set(key, m);
      continue;
    }

    dupes++;

    const existingHasStats = existing.hasDetailedStats ? 1 : 0;
    const newHasStats = m.hasDetailedStats ? 1 : 0;

    if (newHasStats > existingHasStats) {
      index.set(key, m);
    } else if (newHasStats === existingHasStats) {
      const existingPriority = SOURCE_PRIORITY[existing.source] || 0;
      const newPriority = SOURCE_PRIORITY[m.source] || 0;
      if (newPriority > existingPriority) {
        index.set(key, m);
      }
    }
  }

  const result = [...index.values()];
  result.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`  Duplicates removed: ${dupes}`);
  console.log(`  Output: ${result.length} unique matches`);

  return result;
}

/**
 * Split merged matches into current season and historical
 */
export function splitCurrentAndHistorical(matches, currentSeasonCutoff) {
  console.log(`\n=== Splitting at cutoff: ${currentSeasonCutoff} ===`);

  const current = [];
  const historical = [];

  for (const m of matches) {
    if (!validateMatch(m)) continue;

    if (m.date >= currentSeasonCutoff) {
      current.push(m);
    } else {
      historical.push(m);
    }
  }

  current.sort((a, b) => a.date.localeCompare(b.date));
  historical.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`  Current season matches: ${current.length}`);
  console.log(`  Historical matches: ${historical.length}`);

  return { current, historical };
}

/**
 * Determine the cutoff date for "current season"
 * Delegates to the league config's tournament-specific logic
 */
export function determineCutoffDate(matches, leagueConfig) {
  return leagueConfig.tournament.determineCutoffDate(matches);
}
