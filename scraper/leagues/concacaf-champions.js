// CONCACAF Champions Cup configuration
export default {
  id: 'concacaf-champions',
  name: 'CONCACAF Champions Cup',
  shortName: 'CCup',
  espn: { slug: 'concacaf.champions' },
  apifootball: null,
  bsd: null,
  footballdata: null,
  footballcsv: null,
  espnScanStart: '2023-02-01',
  tournament: {
    type: 'annual',
    currentSeasonTournaments: 1,
    // CONCACAF Champions Cup runs Feb-June
    determineCutoffDate(matches) {
      if (matches.length === 0) return '2026-01-01';
      const dates = matches.map(m => m.date).sort();
      const newestDate = dates[dates.length - 1];
      const newestYear = parseInt(newestDate.slice(0, 4));
      // Always Jan 1 of the year of the newest match
      return `${newestYear}-01-01`;
    },
    currentLabel: '2026',
    standingsTitle: 'CONCACAF Champions Cup — 2026',
  },
  standingsZones: [],
  teams: {
    // === Mexican Clubs (6) ===
    cruz_azul: {
      csv: null, espn: ['Cruz Azul'],
      display: { name: 'Cruz Azul', short: 'Cruz Azul', abbr: 'CRZ', color: '#003DA5', tc: '#fff' },
    },
    monterrey: {
      csv: null, espn: ['CF Monterrey', 'Monterrey'],
      display: { name: 'CF Monterrey', short: 'Monterrey', abbr: 'MTY', color: '#004B8D', tc: '#fff' },
    },
    toluca: {
      csv: null, espn: ['Toluca', 'Deportivo Toluca'],
      display: { name: 'Deportivo Toluca', short: 'Toluca', abbr: 'TOL', color: '#C62828', tc: '#fff' },
    },
    pumas: {
      csv: null, espn: ['Pumas UNAM', 'UNAM Pumas'],
      display: { name: 'Pumas UNAM', short: 'Pumas', abbr: 'PUM', color: '#003366', tc: '#fff' },
    },
    america: {
      csv: null, espn: ['America', 'CF America', 'Club America', 'CF América', 'Club América'],
      display: { name: 'Club América', short: 'América', abbr: 'AM', color: '#FFD700', tc: '#1a202c' },
    },
    tigres: {
      csv: null, espn: ['Tigres UANL', 'Tigres'],
      display: { name: 'Tigres UANL', short: 'Tigres', abbr: 'TIG', color: '#FFD100', tc: '#1a202c' },
    },
    // === US/MLS Clubs (8) ===
    lafc: {
      csv: null, espn: ['LAFC', 'Los Angeles FC'],
      display: { name: 'LAFC', short: 'LAFC', abbr: 'LAFC', color: '#C39E6D', tc: '#1a202c' },
    },
    la_galaxy: {
      csv: null, espn: ['LA Galaxy'],
      display: { name: 'LA Galaxy', short: 'LA Galaxy', abbr: 'LA', color: '#00245D', tc: '#fff' },
    },
    cincinnati: {
      csv: null, espn: ['FC Cincinnati', 'Cincinnati'],
      display: { name: 'FC Cincinnati', short: 'Cincinnati', abbr: 'CIN', color: '#F05323', tc: '#fff' },
    },
    inter_miami: {
      csv: null, espn: ['Inter Miami CF', 'Inter Miami'],
      display: { name: 'Inter Miami CF', short: 'Inter Miami', abbr: 'MIA', color: '#F7B5CD', tc: '#1a202c' },
    },
    nashville_sc: {
      csv: null, espn: ['Nashville SC'],
      display: { name: 'Nashville SC', short: 'Nashville', abbr: 'NSH', color: '#ECE83A', tc: '#1a202c' },
    },
    philadelphia_union: {
      csv: null, espn: ['Philadelphia Union'],
      display: { name: 'Philadelphia Union', short: 'Philadelphia', abbr: 'PHI', color: '#071B2C', tc: '#fff' },
    },
    seattle_sounders: {
      csv: null, espn: ['Seattle Sounders FC', 'Seattle Sounders'],
      display: { name: 'Seattle Sounders FC', short: 'Seattle', abbr: 'SEA', color: '#5D9741', tc: '#fff' },
    },
    san_diego: {
      csv: null, espn: ['San Diego FC', 'San Diego'],
      display: { name: 'San Diego FC', short: 'San Diego', abbr: 'SD', color: '#2A2D34', tc: '#fff' },
    },
    // === Canadian Clubs (4) ===
    vancouver_whitecaps: {
      csv: null, espn: ['Vancouver Whitecaps', 'Vancouver Whitecaps FC'],
      display: { name: 'Vancouver Whitecaps', short: 'Vancouver', abbr: 'VAN', color: '#00245E', tc: '#fff' },
    },
    vancouver_fc: {
      csv: null, espn: ['Vancouver FC'],
      display: { name: 'Vancouver FC', short: 'Vancouver FC', abbr: 'VFC', color: '#1a202c', tc: '#fff' },
    },
    atletico_ottawa: {
      csv: null, espn: ['Atletico Ottawa', 'Atlético Ottawa'],
      display: { name: 'Atletico Ottawa', short: 'Ottawa', abbr: 'OTT', color: '#C62828', tc: '#fff' },
    },
    forge: {
      csv: null, espn: ['Forge FC', 'Forge'],
      display: { name: 'Forge FC', short: 'Forge', abbr: 'FOR', color: '#F68712', tc: '#1a202c' },
    },
    // === Central America & Caribbean (9) ===
    alajuelense: {
      csv: null, espn: ['Alajuelense', 'LD Alajuelense'],
      display: { name: 'LD Alajuelense', short: 'Alajuelense', abbr: 'ALA', color: '#CC0000', tc: '#fff' },
    },
    cartagines: {
      csv: null, espn: ['Cartagines', 'CS Cartagines', 'Cartaginés', 'CS Cartaginés'],
      display: { name: 'CS Cartaginés', short: 'Cartaginés', abbr: 'CAR', color: '#003DA5', tc: '#fff' },
    },
    real_espana: {
      csv: null, espn: ['Real Espana', 'Real España'],
      display: { name: 'Real España', short: 'Real España', abbr: 'RES', color: '#003DA5', tc: '#fff' },
    },
    xelaju: {
      csv: null, espn: ['Xelaju', 'Xelaju MC', 'Xelajú', 'Xelajú MC'],
      display: { name: 'Xelajú MC', short: 'Xelajú', abbr: 'XEL', color: '#CC0000', tc: '#fff' },
    },
    olimpia: {
      csv: null, espn: ['Olimpia', 'CD Olimpia'],
      display: { name: 'CD Olimpia', short: 'Olimpia', abbr: 'OLI', color: '#FFFFFF', tc: '#1a202c' },
    },
    defense_force: {
      csv: null, espn: ['Defense Force FC', 'Defense Force'],
      display: { name: 'Defense Force FC', short: 'Defense Force', abbr: 'DEF', color: '#333333', tc: '#fff' },
    },
    mount_pleasant: {
      csv: null, espn: ['Mount Pleasant FA', 'Mount Pleasant'],
      display: { name: 'Mount Pleasant FA', short: 'Mt. Pleasant', abbr: 'MPF', color: '#003DA5', tc: '#fff' },
    },
    sporting_sm: {
      csv: null, espn: ['Sporting San Miguelito', 'Sporting SM'],
      display: { name: 'Sporting San Miguelito', short: 'Sporting SM', abbr: 'SSM', color: '#CC0000', tc: '#fff' },
    },
    universidad_om: {
      csv: null, espn: ['Universidad O&M'],
      display: { name: 'Universidad O&M', short: 'Univ. O&M', abbr: 'UOM', color: '#003DA5', tc: '#fff' },
    },
  },
  defaultHome: 'cruz_azul',
  defaultAway: 'america',
  dataFile: 'concacaf-champions-data.js',
};
