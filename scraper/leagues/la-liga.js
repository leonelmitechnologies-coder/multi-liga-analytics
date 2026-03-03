// La Liga (Spain) configuration
export default {
  id: 'la-liga',
  name: 'La Liga',
  shortName: 'LaLiga',
  espn: { slug: 'esp.1' },
  apifootball: { leagueId: 140, seasons: [2022, 2023, 2024] },
  bsd: { leagueId: 3 },
  footballdata: { competitionCode: 'PD' },
  footballcsv: null,
  tournament: {
    type: 'annual',
    currentSeasonTournaments: 1,
    determineCutoffDate(matches) {
      if (matches.length === 0) return '2024-08-01';
      const dates = matches.map(m => m.date).sort();
      const newestDate = dates[dates.length - 1];
      const newestYear = parseInt(newestDate.slice(0, 4));
      const newestMonth = parseInt(newestDate.slice(5, 7));
      // European season: Aug-May
      if (newestMonth >= 8) return `${newestYear}-08-01`;
      return `${newestYear - 1}-08-01`;
    },
    currentLabel: '2024-25',
    standingsTitle: 'La Liga — 2024-25',
  },
  standingsZones: [
    { range: [1, 4], color: 'var(--ag)', label: 'Champions League (1-4)' },
    { range: [5, 6], color: 'var(--ab)', label: 'Europa League (5-6)' },
    { range: [7, 7], color: 'var(--ap)', label: 'Conference League (7)' },
    { range: [18, 20], color: 'var(--ar)', label: 'Descenso (18-20)' },
  ],
  teams: {
    real_madrid: {
      csv: null, espn: ['Real Madrid'], apifootball: ['Real Madrid'], bsd: ['Real Madrid'], footballdata: ['Real Madrid'],
      display: { name: 'Real Madrid', short: 'Real Madrid', abbr: 'RMA', color: '#FEBE10', tc: '#1a202c' },
    },
    barcelona: {
      csv: null, espn: ['Barcelona', 'FC Barcelona'], apifootball: ['Barcelona', 'FC Barcelona'], bsd: ['Barcelona', 'FC Barcelona'], footballdata: ['Barcelona', 'FC Barcelona', 'Barça'],
      display: { name: 'FC Barcelona', short: 'Barcelona', abbr: 'BAR', color: '#A50044', tc: '#fff' },
    },
    atletico_madrid: {
      csv: null, espn: ['Atlético Madrid', 'Atletico Madrid', 'Atlético de Madrid'], apifootball: ['Atletico Madrid', 'Atlético Madrid'], bsd: ['Atletico Madrid', 'Atlético de Madrid', 'Atlético Madrid'], footballdata: ['Atlético', 'Atletico Madrid', 'Atlético de Madrid'],
      display: { name: 'Atlético Madrid', short: 'Atlético', abbr: 'ATM', color: '#272E61', tc: '#fff' },
    },
    athletic_bilbao: {
      csv: null, espn: ['Athletic Bilbao', 'Athletic Club'], apifootball: ['Athletic Club', 'Athletic Bilbao'], bsd: ['Athletic Bilbao', 'Athletic Club'], footballdata: ['Athletic', 'Athletic Club'],
      display: { name: 'Athletic Club', short: 'Athletic', abbr: 'ATH', color: '#EE2523', tc: '#fff' },
    },
    villarreal: {
      csv: null, espn: ['Villarreal', 'Villarreal CF'], apifootball: ['Villarreal', 'Villarreal CF'], bsd: ['Villarreal', 'Villarreal CF'], footballdata: ['Villarreal'],
      display: { name: 'Villarreal CF', short: 'Villarreal', abbr: 'VIL', color: '#FFE114', tc: '#1a202c' },
    },
    real_betis: {
      csv: null, espn: ['Real Betis', 'Real Betis Balompié'], apifootball: ['Real Betis', 'Betis'], bsd: ['Real Betis', 'Betis', 'Real Betis Balompie'], footballdata: ['Betis', 'Real Betis'],
      display: { name: 'Real Betis', short: 'Betis', abbr: 'BET', color: '#00954C', tc: '#fff' },
    },
    real_sociedad: {
      csv: null, espn: ['Real Sociedad'], apifootball: ['Real Sociedad'], bsd: ['Real Sociedad'], footballdata: ['Real Sociedad'],
      display: { name: 'Real Sociedad', short: 'R. Sociedad', abbr: 'RSO', color: '#143C8B', tc: '#fff' },
    },
    girona: {
      csv: null, espn: ['Girona', 'Girona FC'], apifootball: ['Girona', 'Girona FC'], bsd: ['Girona', 'Girona FC'], footballdata: ['Girona'],
      display: { name: 'Girona FC', short: 'Girona', abbr: 'GIR', color: '#CD2534', tc: '#fff' },
    },
    celta_vigo: {
      csv: null, espn: ['Celta Vigo', 'Celta de Vigo', 'RC Celta'], apifootball: ['Celta Vigo', 'RC Celta'], bsd: ['Celta Vigo', 'Celta de Vigo', 'RC Celta'], footballdata: ['Celta', 'Celta Vigo'],
      display: { name: 'RC Celta', short: 'Celta', abbr: 'CEL', color: '#8AC3EE', tc: '#1a202c' },
    },
    osasuna: {
      csv: null, espn: ['Osasuna', 'CA Osasuna'], apifootball: ['Osasuna', 'CA Osasuna'], bsd: ['Osasuna', 'CA Osasuna'], footballdata: ['Osasuna', 'CA Osasuna'],
      display: { name: 'CA Osasuna', short: 'Osasuna', abbr: 'OSA', color: '#0A346F', tc: '#fff' },
    },
    mallorca: {
      csv: null, espn: ['Mallorca', 'RCD Mallorca'], apifootball: ['Mallorca', 'RCD Mallorca'], bsd: ['Mallorca', 'RCD Mallorca'], footballdata: ['Mallorca', 'RCD Mallorca'],
      display: { name: 'RCD Mallorca', short: 'Mallorca', abbr: 'MLL', color: '#E20613', tc: '#fff' },
    },
    getafe: {
      csv: null, espn: ['Getafe', 'Getafe CF'], apifootball: ['Getafe', 'Getafe CF'], bsd: ['Getafe', 'Getafe CF'], footballdata: ['Getafe'],
      display: { name: 'Getafe CF', short: 'Getafe', abbr: 'GET', color: '#004FA3', tc: '#fff' },
    },
    rayo_vallecano: {
      csv: null, espn: ['Rayo Vallecano'], apifootball: ['Rayo Vallecano'], bsd: ['Rayo Vallecano'], footballdata: ['Rayo Vallecano', 'Rayo'],
      display: { name: 'Rayo Vallecano', short: 'Rayo', abbr: 'RAY', color: '#E53027', tc: '#fff' },
    },
    sevilla: {
      csv: null, espn: ['Sevilla', 'Sevilla FC'], apifootball: ['Sevilla', 'Sevilla FC'], bsd: ['Sevilla', 'Sevilla FC'], footballdata: ['Sevilla'],
      display: { name: 'Sevilla FC', short: 'Sevilla', abbr: 'SEV', color: '#D4001E', tc: '#fff' },
    },
    alaves: {
      csv: null, espn: ['Alavés', 'Alaves', 'Deportivo Alavés'], apifootball: ['Alaves', 'Deportivo Alavés'], bsd: ['Alaves', 'Deportivo Alaves', 'Deportivo Alavés'], footballdata: ['Alavés', 'Deportivo Alavés'],
      display: { name: 'Deportivo Alavés', short: 'Alavés', abbr: 'ALA', color: '#00529F', tc: '#fff' },
    },
    espanyol: {
      csv: null, espn: ['Espanyol', 'RCD Espanyol'], apifootball: ['Espanyol', 'RCD Espanyol'], bsd: ['Espanyol', 'RCD Espanyol'], footballdata: ['Espanyol', 'RCD Espanyol'],
      display: { name: 'RCD Espanyol', short: 'Espanyol', abbr: 'ESP', color: '#007FC8', tc: '#fff' },
    },
    valencia: {
      csv: null, espn: ['Valencia', 'Valencia CF'], apifootball: ['Valencia', 'Valencia CF'], bsd: ['Valencia', 'Valencia CF'], footballdata: ['Valencia'],
      display: { name: 'Valencia CF', short: 'Valencia', abbr: 'VAL', color: '#EE3524', tc: '#fff' },
    },
    valladolid: {
      csv: null, espn: ['Real Valladolid', 'Valladolid'], apifootball: ['Real Valladolid', 'Valladolid'], bsd: ['Real Valladolid', 'Valladolid'], footballdata: ['Valladolid', 'Real Valladolid'],
      display: { name: 'Real Valladolid', short: 'Valladolid', abbr: 'VLL', color: '#591C87', tc: '#fff' },
    },
    las_palmas: {
      csv: null, espn: ['Las Palmas', 'UD Las Palmas'], apifootball: ['Las Palmas', 'UD Las Palmas'], bsd: ['Las Palmas', 'UD Las Palmas'], footballdata: ['Las Palmas', 'UD Las Palmas'],
      display: { name: 'UD Las Palmas', short: 'Las Palmas', abbr: 'LPA', color: '#FFE400', tc: '#1a202c' },
    },
    leganes: {
      csv: null, espn: ['Leganés', 'Leganes', 'CD Leganés'], apifootball: ['Leganes', 'CD Leganés'], bsd: ['Leganes', 'CD Leganes', 'CD Leganés'], footballdata: ['Leganés', 'CD Leganés'],
      display: { name: 'CD Leganés', short: 'Leganés', abbr: 'LEG', color: '#1E4696', tc: '#fff' },
    },
  },
  defaultHome: 'real_madrid',
  defaultAway: 'barcelona',
  dataFile: 'la-liga-data.js',
};
