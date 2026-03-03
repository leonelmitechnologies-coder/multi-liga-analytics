// League registry — imports all league configs and provides lookup
import ligaMX from './liga-mx.js';
import laLiga from './la-liga.js';
import premierLeague from './premier-league.js';
import serieA from './serie-a.js';
import bundesliga from './bundesliga.js';
import championsLeague from './champions-league.js';
import mls from './mls.js';

const LEAGUES = {
  'liga-mx': ligaMX,
  'la-liga': laLiga,
  'premier-league': premierLeague,
  'serie-a': serieA,
  'bundesliga': bundesliga,
  'champions-league': championsLeague,
  'mls': mls,
};

export const AVAILABLE_LEAGUES = Object.keys(LEAGUES);

export function getLeagueConfig(id) {
  const config = LEAGUES[id];
  if (!config) throw new Error(`Unknown league: "${id}". Available: ${AVAILABLE_LEAGUES.join(', ')}`);
  return config;
}

export function getAllLeagueConfigs() {
  return Object.values(LEAGUES);
}
