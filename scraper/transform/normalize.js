import { stripAccents } from '../config.js';

/**
 * Normalize referee names to consistent keys
 */
export function normalizeRefereeName(name) {
  if (!name) return 'unknown';
  return stripAccents(name)
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(-1)[0] || 'unknown';
}

/**
 * Build referee stats from match data
 */
export function buildRefereeStats(matches) {
  const refData = {};

  for (const m of matches) {
    const ref = m.referee || 'unknown';
    const refKey = normalizeRefereeName(ref);

    if (!refData[refKey]) {
      refData[refKey] = {
        name: ref,
        names: new Set([ref]),
        matches: 0,
        totalYC: 0,
        totalRC: 0,
        totalFouls: 0,
      };
    }

    refData[refKey].names.add(ref);
    refData[refKey].matches++;

    if (m.homeStats && m.awayStats) {
      refData[refKey].totalYC += (m.homeStats.yellowCards || 0) + (m.awayStats.yellowCards || 0);
      refData[refKey].totalRC += (m.homeStats.redCards || 0) + (m.awayStats.redCards || 0);
      refData[refKey].totalFouls += (m.homeStats.fouls || 0) + (m.awayStats.fouls || 0);
    }
  }

  let totalMatches = 0, totalYC = 0;
  for (const r of Object.values(refData)) {
    if (r.matches >= 3) {
      totalMatches += r.matches;
      totalYC += r.totalYC;
    }
  }
  const leagueAvgYC = totalMatches > 0 ? totalYC / totalMatches : 4.0;

  const referees = {};
  for (const [key, r] of Object.entries(refData)) {
    if (r.matches < 2) continue;

    const avgYC = r.totalYC / r.matches;
    const avgRC = r.totalRC / r.matches;
    const avgFouls = r.totalFouls / r.matches;

    referees[key] = {
      name: r.name,
      badge: r.matches >= 20 ? 'FIFA' : 'Nacional',
      matches: r.matches,
      strictness: leagueAvgYC > 0 ? +(avgYC / leagueAvgYC).toFixed(2) : 1.0,
      avgYC: +avgYC.toFixed(1),
      avgRC: +avgRC.toFixed(2),
      avgFouls: +avgFouls.toFixed(1),
      avgPens: 0,
    };
  }

  return referees;
}

/**
 * Validate and clean match data
 */
export function validateMatch(m) {
  if (!m.homeTeam || !m.awayTeam) return false;
  if (m.homeGoals === null || m.homeGoals === undefined) return false;
  if (m.awayGoals === null || m.awayGoals === undefined) return false;
  if (!m.date) return false;
  return true;
}

/**
 * Ensure team key exists in league config
 */
export function isKnownTeam(key, leagueConfig) {
  return key in leagueConfig.teams;
}
