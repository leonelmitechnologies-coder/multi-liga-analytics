// Shared utilities for the scraper
// League-specific config lives in ./leagues/

export { getLeagueConfig, AVAILABLE_LEAGUES, getAllLeagueConfigs } from './leagues/index.js';

export function stripAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Build reverse lookup: source name → internal team key
 * @param {string} source — 'csv', 'espn', or 'apifootball'
 * @param {object} teams — leagueConfig.teams
 */
export function buildNameLookup(source, teams) {
  const lookup = {};
  for (const [key, team] of Object.entries(teams)) {
    const names = team[source];
    if (!names) continue;
    for (const name of names) {
      lookup[name.toLowerCase()] = key;
      lookup[stripAccents(name).toLowerCase()] = key;
    }
  }
  return lookup;
}
