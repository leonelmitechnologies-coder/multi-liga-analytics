import { normalizeRefereeName, buildRefereeStats } from './normalize.js';

/**
 * Format current season matches into the SEASON_MATCHES contract
 */
export function formatSeasonMatches(matches) {
  return matches.map((m, i) => ({
    jornada: m.jornada || Math.ceil((i + 1) / 9),
    date: m.date,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    referee: normalizeRefereeName(m.referee),
    homeGoals: m.homeGoals,
    awayGoals: m.awayGoals,
    homeStats: m.homeStats || defaultStats(),
    awayStats: m.awayStats || defaultStats(),
  }));
}

/**
 * Format historical matches into the H2H_HISTORY contract
 */
export function formatH2HHistory(matches) {
  return matches.map(m => ({
    date: m.date,
    home: m.homeTeam,
    away: m.awayTeam,
    hG: m.homeGoals,
    aG: m.awayGoals,
    cards: m.homeStats && m.awayStats
      ? (m.homeStats.yellowCards || 0) + (m.awayStats.yellowCards || 0) +
        (m.homeStats.redCards || 0) + (m.awayStats.redCards || 0)
      : 4,
    corners: m.homeStats && m.awayStats
      ? (m.homeStats.corners || 0) + (m.awayStats.corners || 0)
      : 10,
    ref: normalizeRefereeName(m.referee),
  }));
}

/**
 * Build the TEAMS object from league config
 * @param {object} leagueConfig
 */
export function formatTeams(leagueConfig) {
  const teams = {};
  for (const [key, team] of Object.entries(leagueConfig.teams)) {
    teams[key] = { ...team.display };
  }
  return teams;
}

/**
 * Build the REFEREES object from match data
 */
export function formatReferees(allMatches) {
  return buildRefereeStats(allMatches);
}

/**
 * Format BSD ML predictions for output JS
 */
export function formatBSDPredictions(predictions) {
  if (!predictions || predictions.length === 0) return [];

  return predictions.map(p => ({
    date: p.date,
    homeTeam: p.homeTeam,
    awayTeam: p.awayTeam,
    prob1: +p.prob1.toFixed(3),
    probX: +p.probX.toFixed(3),
    prob2: +p.prob2.toFixed(3),
    probOver25: +p.probOver25.toFixed(3),
    probBTTS: +p.probBTTS.toFixed(3),
    expectedHomeGoals: +(p.expectedHomeGoals || 0).toFixed(2),
    expectedAwayGoals: +(p.expectedAwayGoals || 0).toFixed(2),
    mostLikelyScore: p.mostLikelyScore || null,
    confidence: +p.confidence.toFixed(3),
    modelVersion: p.modelVersion || 'unknown',
  }));
}

/**
 * Format injuries map for JS output — sanitize strings
 */
export function formatInjuries(injuriesMap) {
  if (!injuriesMap || typeof injuriesMap !== 'object') return {};
  const result = {};
  for (const [teamKey, data] of Object.entries(injuriesMap)) {
    result[teamKey] = {
      count: data.count || 0,
      out: (data.out || []).map(p => ({
        player: (p.player || 'Unknown').replace(/[<>"]/g, ''),
        type: (p.type || '').replace(/[<>"]/g, ''),
        reason: (p.reason || '').replace(/[<>"]/g, ''),
      })),
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };
  }
  return result;
}

/**
 * Format top scorers from football-data.org for JS output
 */
export function formatTopScorers(scorers) {
  if (!scorers || scorers.length === 0) return [];

  return scorers.map((s, i) => ({
    rank: i + 1,
    player: s.playerName,
    team: s.teamKey,
    goals: s.goals,
    assists: s.assists,
    penalties: s.penalties,
    played: s.played,
    perMatch: s.played > 0 ? +(s.goals / s.played).toFixed(2) : 0,
  }));
}

/**
 * Default stats object for matches without detailed data
 */
function defaultStats() {
  return {
    possession: 50,
    shotsTotal: 0,
    shotsOnTarget: 0,
    corners: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    offsides: 0,
    freeKicks: 0,
    xG: 0,
    firstGoalMinute: null,
  };
}

/**
 * Compute league averages from matches with detailed stats
 */
export function computeLeagueAverages(matches) {
  const withStats = matches.filter(m => m.homeStats && m.homeStats.shotsTotal > 0);
  if (withStats.length === 0) return null;

  const n = withStats.length;
  const sum = (fn) => withStats.reduce((acc, m) => acc + fn(m), 0) / n;

  return {
    possession: 50,
    shotsTotal: +sum(m => (m.homeStats.shotsTotal + m.awayStats.shotsTotal) / 2).toFixed(1),
    shotsOnTarget: +sum(m => (m.homeStats.shotsOnTarget + m.awayStats.shotsOnTarget) / 2).toFixed(1),
    corners: +sum(m => (m.homeStats.corners + m.awayStats.corners) / 2).toFixed(1),
    fouls: +sum(m => (m.homeStats.fouls + m.awayStats.fouls) / 2).toFixed(1),
    yellowCards: +sum(m => (m.homeStats.yellowCards + m.awayStats.yellowCards) / 2).toFixed(1),
    redCards: +sum(m => (m.homeStats.redCards + m.awayStats.redCards) / 2).toFixed(2),
    offsides: +sum(m => (m.homeStats.offsides + m.awayStats.offsides) / 2).toFixed(1),
    freeKicks: +sum(m => (m.homeStats.freeKicks + m.awayStats.freeKicks) / 2).toFixed(1),
    xG: +sum(m => (m.homeStats.xG + m.awayStats.xG) / 2).toFixed(2),
    goalsPerMatch: +sum(m => m.homeGoals + m.awayGoals).toFixed(2),
    cardsPerMatch: +sum(m => (m.homeStats.yellowCards + m.awayStats.yellowCards + m.homeStats.redCards + m.awayStats.redCards)).toFixed(1),
  };
}

/**
 * Enrich CSV-only matches with league average stats
 */
export function enrichWithAverages(matches, averages) {
  if (!averages) return matches;

  return matches.map(m => {
    if (m.homeStats && m.homeStats.shotsTotal > 0) return m;

    const goalFactor = (m.homeGoals + m.awayGoals) / (averages.goalsPerMatch || 2.5);

    return {
      ...m,
      homeStats: {
        possession: 50,
        shotsTotal: Math.round(averages.shotsTotal * (0.8 + Math.random() * 0.4)),
        shotsOnTarget: Math.round(averages.shotsOnTarget * (0.7 + Math.random() * 0.6)),
        corners: Math.round(averages.corners * (0.7 + Math.random() * 0.6)),
        fouls: Math.round(averages.fouls * (0.8 + Math.random() * 0.4)),
        yellowCards: Math.round(averages.yellowCards * (0.7 + Math.random() * 0.6)),
        redCards: Math.round(averages.redCards * (Math.random() > 0.85 ? 1 : 0)),
        offsides: Math.round(averages.offsides * (0.5 + Math.random() * 1.0)),
        freeKicks: Math.round(averages.freeKicks * (0.8 + Math.random() * 0.4)),
        xG: +(m.homeGoals * 0.85 + Math.random() * 0.3).toFixed(2),
        firstGoalMinute: null,
      },
      awayStats: {
        possession: 50,
        shotsTotal: Math.round(averages.shotsTotal * (0.7 + Math.random() * 0.4)),
        shotsOnTarget: Math.round(averages.shotsOnTarget * (0.6 + Math.random() * 0.6)),
        corners: Math.round(averages.corners * (0.6 + Math.random() * 0.6)),
        fouls: Math.round(averages.fouls * (0.8 + Math.random() * 0.4)),
        yellowCards: Math.round(averages.yellowCards * (0.7 + Math.random() * 0.6)),
        redCards: Math.round(averages.redCards * (Math.random() > 0.9 ? 1 : 0)),
        offsides: Math.round(averages.offsides * (0.5 + Math.random() * 1.0)),
        freeKicks: Math.round(averages.freeKicks * (0.8 + Math.random() * 0.4)),
        xG: +(m.awayGoals * 0.85 + Math.random() * 0.3).toFixed(2),
        firstGoalMinute: null,
      },
    };
  });
}
