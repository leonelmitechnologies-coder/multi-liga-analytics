// Liga MX configuration
export default {
  id: 'liga-mx',
  name: 'Liga MX',
  shortName: 'LigaMX',
  espn: { slug: 'mex.1' },
  apifootball: { leagueId: 262, seasons: [2022, 2023, 2024] },
  bsd: { leagueId: 20, leagueIdApertura: 19, leagueIdClausura: 20 },
  footballdata: null,
  footballcsv: {
    baseUrl: 'https://raw.githubusercontent.com/footballcsv/mexico/master',
    seasons: ['2024-25', '2023-24', '2022-23'],
    file: 'mx.1.csv',
  },
  tournament: {
    type: 'biannual',
    currentSeasonTournaments: 2,
    determineCutoffDate(matches) {
      if (matches.length === 0) return '2025-01-01';
      const dates = matches.map(m => m.date).sort();
      const newestDate = dates[dates.length - 1];
      const newestYear = parseInt(newestDate.slice(0, 4));
      const newestMonth = parseInt(newestDate.slice(5, 7));
      if (newestMonth <= 6) {
        return `${newestYear - 1}-07-01`;
      } else {
        return `${newestYear}-01-01`;
      }
    },
    currentLabel: 'Clausura 2025',
    standingsTitle: 'Tabla General — Clausura 2025',
  },
  standingsZones: [
    { range: [1, 4], color: 'var(--ag)', label: 'Liguilla directa (1-4)' },
    { range: [5, 12], color: 'var(--ab)', label: 'Play-In (5-12)' },
  ],
  teams: {
    america: {
      csv: ['CF América', 'Club América', 'América'],
      espn: ['América', 'CF América', 'Club America', 'Club América'],
      apifootball: ['Club America', 'CF América', 'América'],
      bsd: ['Club America', 'CF América', 'América'],
      display: { name: 'Club América', short: 'América', abbr: 'AM', color: '#FFD700', tc: '#1a202c' },
    },
    guadalajara: {
      csv: ['Deportivo Guadalajara', 'CD Guadalajara', 'Guadalajara', 'Chivas'],
      espn: ['Guadalajara', 'CD Guadalajara', 'Deportivo Guadalajara', 'Chivas'],
      apifootball: ['Guadalajara', 'CD Guadalajara', 'Chivas'],
      bsd: ['Guadalajara', 'CD Guadalajara', 'Chivas'],
      display: { name: 'C.D. Guadalajara', short: 'Guadalajara', abbr: 'GU', color: '#C62828', tc: '#fff' },
    },
    cruz_azul: {
      csv: ['Cruz Azul'],
      espn: ['Cruz Azul'],
      apifootball: ['Cruz Azul'],
      bsd: ['Cruz Azul'],
      display: { name: 'Cruz Azul', short: 'Cruz Azul', abbr: 'CA', color: '#003DA5', tc: '#fff' },
    },
    pumas: {
      csv: ['Pumas UNAM', 'UNAM'],
      espn: ['Pumas UNAM', 'UNAM Pumas', 'UNAM'],
      apifootball: ['Pumas UNAM', 'UNAM'],
      bsd: ['Pumas UNAM', 'UNAM'],
      display: { name: 'Pumas UNAM', short: 'Pumas', abbr: 'PU', color: '#1a237e', tc: '#FFD700' },
    },
    tigres: {
      csv: ['UANL Tigres', 'Tigres UANL', 'Tigres'],
      espn: ['Tigres UANL', 'Tigres', 'UANL Tigres'],
      apifootball: ['Tigres UANL', 'UANL Tigres'],
      bsd: ['Tigres UANL', 'Tigres'],
      display: { name: 'Tigres UANL', short: 'Tigres', abbr: 'TI', color: '#F9A825', tc: '#1a202c' },
    },
    monterrey: {
      csv: ['CF Monterrey', 'Monterrey'],
      espn: ['CF Monterrey', 'Monterrey'],
      apifootball: ['Monterrey', 'CF Monterrey'],
      bsd: ['Monterrey', 'CF Monterrey'],
      display: { name: 'C.F. Monterrey', short: 'Monterrey', abbr: 'MO', color: '#003366', tc: '#fff' },
    },
    toluca: {
      csv: ['Deportivo Toluca', 'Toluca'],
      espn: ['Toluca', 'Deportivo Toluca'],
      apifootball: ['Toluca', 'Deportivo Toluca'],
      bsd: ['Toluca', 'Deportivo Toluca'],
      display: { name: 'Deportivo Toluca', short: 'Toluca', abbr: 'TO', color: '#C62828', tc: '#fff' },
    },
    santos: {
      csv: ['Santos Laguna', 'Santos'],
      espn: ['Santos Laguna', 'Santos'],
      apifootball: ['Santos Laguna'],
      bsd: ['Santos Laguna', 'Santos'],
      display: { name: 'Santos Laguna', short: 'Santos', abbr: 'SA', color: '#2E7D32', tc: '#fff' },
    },
    leon: {
      csv: ['Club León', 'León'],
      espn: ['Club León', 'León'],
      apifootball: ['Club Leon', 'León'],
      bsd: ['Club Leon', 'León'],
      display: { name: 'Club León', short: 'León', abbr: 'LE', color: '#2E7D32', tc: '#fff' },
    },
    pachuca: {
      csv: ['CF Pachuca', 'Pachuca'],
      espn: ['CF Pachuca', 'Pachuca'],
      apifootball: ['Pachuca', 'CF Pachuca'],
      bsd: ['Pachuca', 'CF Pachuca'],
      display: { name: 'C.F. Pachuca', short: 'Pachuca', abbr: 'PA', color: '#1565C0', tc: '#fff' },
    },
    atlas: {
      csv: ['Atlas Guadalajara', 'Atlas', 'Atlas FC'],
      espn: ['Atlas', 'Atlas Guadalajara', 'Atlas FC'],
      apifootball: ['Atlas', 'Atlas FC'],
      bsd: ['Atlas', 'Atlas FC'],
      display: { name: 'Atlas F.C.', short: 'Atlas', abbr: 'AT', color: '#B71C1C', tc: '#1a202c' },
    },
    tijuana: {
      csv: ['Club Tijuana', 'Tijuana', 'Xolos'],
      espn: ['Club Tijuana', 'Tijuana', 'Xolos de Tijuana'],
      apifootball: ['Club Tijuana', 'Tijuana'],
      bsd: ['Club Tijuana', 'Tijuana'],
      display: { name: 'Club Tijuana', short: 'Tijuana', abbr: 'TJ', color: '#B71C1C', tc: '#fff' },
    },
    puebla: {
      csv: ['Puebla FC', 'Puebla'],
      espn: ['Puebla', 'Puebla FC'],
      apifootball: ['Puebla', 'Puebla FC'],
      bsd: ['Puebla', 'Puebla FC'],
      display: { name: 'Puebla F.C.', short: 'Puebla', abbr: 'PB', color: '#1565C0', tc: '#fff' },
    },
    queretaro: {
      csv: ['Gallos Blancos', 'Querétaro', 'Querétaro FC'],
      espn: ['Querétaro', 'Queretaro', 'Gallos Blancos'],
      apifootball: ['Queretaro', 'Querétaro FC'],
      bsd: ['Queretaro', 'Querétaro'],
      display: { name: 'Querétaro F.C.', short: 'Querétaro', abbr: 'QE', color: '#1565C0', tc: '#fff' },
    },
    necaxa: {
      csv: ['Club Necaxa', 'Necaxa'],
      espn: ['Necaxa', 'Club Necaxa'],
      apifootball: ['Necaxa', 'Club Necaxa'],
      bsd: ['Necaxa', 'Club Necaxa'],
      display: { name: 'Club Necaxa', short: 'Necaxa', abbr: 'NE', color: '#C62828', tc: '#fff' },
    },
    mazatlan: {
      csv: ['Mazatlán FC', 'Mazatlán'],
      espn: ['Mazatlán FC', 'Mazatlan FC', 'Mazatlán'],
      apifootball: ['Mazatlan FC', 'Mazatlán FC'],
      bsd: ['Mazatlan FC', 'Mazatlán FC'],
      display: { name: 'Mazatlán F.C.', short: 'Mazatlán', abbr: 'MZ', color: '#4A148C', tc: '#fff' },
    },
    juarez: {
      csv: ['FC Juárez', 'Juárez'],
      espn: ['FC Juárez', 'Juárez', 'FC Juarez'],
      apifootball: ['FC Juarez', 'FC Juárez'],
      bsd: ['FC Juarez', 'FC Juárez'],
      display: { name: 'FC Juárez', short: 'Juárez', abbr: 'JU', color: '#2E7D32', tc: '#fff' },
    },
    san_luis: {
      csv: ['Atlético San Luis', 'San Luis', 'Atlético de San Luis'],
      espn: ['Atlético de San Luis', 'Atlético San Luis', 'Atl. San Luis', 'San Luis'],
      apifootball: ['Atletico San Luis', 'Atlético de San Luis'],
      bsd: ['Atletico San Luis', 'Atlético de San Luis'],
      display: { name: 'Atlético San Luis', short: 'San Luis', abbr: 'SL', color: '#C62828', tc: '#fff' },
    },
  },
  defaultHome: 'tigres',
  defaultAway: 'guadalajara',
  dataFile: 'liga-mx-data.js',
};
