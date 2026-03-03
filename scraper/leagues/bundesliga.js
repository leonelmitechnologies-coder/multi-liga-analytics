// Bundesliga (Germany) configuration
export default {
  id: 'bundesliga',
  name: 'Bundesliga',
  shortName: 'Bundesliga',
  espn: { slug: 'ger.1' },
  apifootball: { leagueId: 78, seasons: [2022, 2023, 2024] },
  bsd: { leagueId: 5 },
  footballdata: { competitionCode: 'BL1' },
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
      if (newestMonth >= 8) return `${newestYear}-08-01`;
      return `${newestYear - 1}-08-01`;
    },
    currentLabel: '2024-25',
    standingsTitle: 'Bundesliga — 2024-25',
  },
  standingsZones: [
    { range: [1, 4], color: 'var(--ag)', label: 'Champions League (1-4)' },
    { range: [5, 6], color: 'var(--ab)', label: 'Europa League (5-6)' },
    { range: [7, 7], color: 'var(--ap)', label: 'Conference League (7)' },
    { range: [16, 16], color: 'var(--ao)', label: 'Playoff (16)' },
    { range: [17, 18], color: 'var(--ar)', label: 'Abstieg (17-18)' },
  ],
  teams: {
    bayern: {
      csv: null, espn: ['Bayern Munich', 'FC Bayern Munich', 'Bayern München'], apifootball: ['Bayern Munich', 'Bayern München'],
      bsd: ['Bayern Munich', 'FC Bayern München', 'FC Bayern Munich', 'Bayern München'],
      footballdata: ['Bayern', 'FC Bayern München'],
      display: { name: 'Bayern Munich', short: 'Bayern', abbr: 'BAY', color: '#DC052D', tc: '#fff' },
    },
    dortmund: {
      csv: null, espn: ['Borussia Dortmund', 'Dortmund'], apifootball: ['Borussia Dortmund', 'Dortmund'],
      bsd: ['Borussia Dortmund', 'Dortmund', 'BV Borussia Dortmund'],
      footballdata: ['Dortmund', 'Borussia Dortmund'],
      display: { name: 'Borussia Dortmund', short: 'Dortmund', abbr: 'BVB', color: '#FDE100', tc: '#1a202c' },
    },
    leverkusen: {
      csv: null, espn: ['Bayer Leverkusen', 'Bayer 04 Leverkusen', 'Leverkusen'], apifootball: ['Bayer Leverkusen', 'Bayer 04 Leverkusen'],
      bsd: ['Bayer Leverkusen', 'Bayer 04 Leverkusen', 'Leverkusen'],
      footballdata: ['Leverkusen', 'Bayer 04 Leverkusen'],
      display: { name: 'Bayer Leverkusen', short: 'Leverkusen', abbr: 'B04', color: '#E32221', tc: '#fff' },
    },
    rb_leipzig: {
      csv: null, espn: ['RB Leipzig', 'Leipzig'], apifootball: ['RB Leipzig', 'Leipzig'],
      bsd: ['RB Leipzig', 'Leipzig', 'RasenBallsport Leipzig'],
      footballdata: ['Leipzig', 'RB Leipzig'],
      display: { name: 'RB Leipzig', short: 'Leipzig', abbr: 'RBL', color: '#DD0741', tc: '#fff' },
    },
    eintracht: {
      csv: null, espn: ['Eintracht Frankfurt', 'Frankfurt'], apifootball: ['Eintracht Frankfurt', 'Frankfurt'],
      bsd: ['Eintracht Frankfurt', 'Frankfurt', 'SG Eintracht Frankfurt'],
      footballdata: ['Frankfurt', 'Eintracht Frankfurt'],
      display: { name: 'Eintracht Frankfurt', short: 'Frankfurt', abbr: 'SGE', color: '#000000', tc: '#fff' },
    },
    freiburg: {
      csv: null, espn: ['SC Freiburg', 'Freiburg'], apifootball: ['SC Freiburg', 'Freiburg'],
      bsd: ['SC Freiburg', 'Freiburg', 'Sport-Club Freiburg'],
      footballdata: ['Freiburg', 'SC Freiburg'],
      display: { name: 'SC Freiburg', short: 'Freiburg', abbr: 'SCF', color: '#000000', tc: '#fff' },
    },
    stuttgart: {
      csv: null, espn: ['VfB Stuttgart', 'Stuttgart'], apifootball: ['VfB Stuttgart', 'Stuttgart'],
      bsd: ['VfB Stuttgart', 'Stuttgart', 'VfB Stuttgart 1893'],
      footballdata: ['Stuttgart', 'VfB Stuttgart'],
      display: { name: 'VfB Stuttgart', short: 'Stuttgart', abbr: 'VFB', color: '#E32219', tc: '#fff' },
    },
    wolfsburg: {
      csv: null, espn: ['VfL Wolfsburg', 'Wolfsburg'], apifootball: ['VfL Wolfsburg', 'Wolfsburg'],
      bsd: ['VfL Wolfsburg', 'Wolfsburg'],
      footballdata: ['Wolfsburg', 'VfL Wolfsburg'],
      display: { name: 'VfL Wolfsburg', short: 'Wolfsburg', abbr: 'WOB', color: '#65B32E', tc: '#fff' },
    },
    union_berlin: {
      csv: null, espn: ['Union Berlin', '1. FC Union Berlin'], apifootball: ['Union Berlin', '1. FC Union Berlin'],
      bsd: ['Union Berlin', '1. FC Union Berlin', 'FC Union Berlin'],
      footballdata: ['Union Berlin', '1. FC Union Berlin'],
      display: { name: 'Union Berlin', short: 'Union Berlin', abbr: 'FCU', color: '#EB1923', tc: '#fff' },
    },
    gladbach: {
      csv: null, espn: ["Borussia Mönchengladbach", "Borussia M'gladbach", "Mönchengladbach", "M'gladbach"], apifootball: ['Borussia Monchengladbach', 'Borussia Mönchengladbach'],
      bsd: ['Borussia Monchengladbach', 'Borussia Mönchengladbach', "Borussia M'gladbach", 'Gladbach'],
      footballdata: ["M'gladbach", 'Mönchengladbach', 'Borussia Mönchengladbach'],
      display: { name: "B. Mönchengladbach", short: "M'gladbach", abbr: 'BMG', color: '#000000', tc: '#fff' },
    },
    werder: {
      csv: null, espn: ['Werder Bremen', 'Bremen'], apifootball: ['Werder Bremen', 'Bremen'],
      bsd: ['Werder Bremen', 'Bremen', 'SV Werder Bremen'],
      footballdata: ['Bremen', 'Werder Bremen'],
      display: { name: 'Werder Bremen', short: 'Bremen', abbr: 'SVW', color: '#1D9053', tc: '#fff' },
    },
    mainz: {
      csv: null, espn: ['1. FSV Mainz 05', 'Mainz', 'Mainz 05'], apifootball: ['Mainz', 'FSV Mainz 05', '1. FSV Mainz 05'],
      bsd: ['Mainz 05', '1. FSV Mainz 05', 'FSV Mainz 05', 'Mainz'],
      footballdata: ['Mainz', 'Mainz 05'],
      display: { name: 'Mainz 05', short: 'Mainz', abbr: 'M05', color: '#C3141E', tc: '#fff' },
    },
    augsburg: {
      csv: null, espn: ['FC Augsburg', 'Augsburg'], apifootball: ['FC Augsburg', 'Augsburg'],
      bsd: ['FC Augsburg', 'Augsburg'],
      footballdata: ['Augsburg', 'FC Augsburg'],
      display: { name: 'FC Augsburg', short: 'Augsburg', abbr: 'FCA', color: '#BA3733', tc: '#fff' },
    },
    hoffenheim: {
      csv: null, espn: ['TSG Hoffenheim', 'Hoffenheim', '1899 Hoffenheim'], apifootball: ['Hoffenheim', 'TSG Hoffenheim', '1899 Hoffenheim'],
      bsd: ['TSG Hoffenheim', '1899 Hoffenheim', 'Hoffenheim', 'TSG 1899 Hoffenheim'],
      footballdata: ['Hoffenheim', 'TSG Hoffenheim'],
      display: { name: 'TSG Hoffenheim', short: 'Hoffenheim', abbr: 'TSG', color: '#1961B5', tc: '#fff' },
    },
    heidenheim: {
      csv: null, espn: ['1. FC Heidenheim', 'Heidenheim'], apifootball: ['Heidenheim', '1. FC Heidenheim'],
      bsd: ['1. FC Heidenheim', 'Heidenheim', '1. FC Heidenheim 1846'],
      footballdata: ['Heidenheim', '1. FC Heidenheim'],
      display: { name: '1. FC Heidenheim', short: 'Heidenheim', abbr: 'HDH', color: '#E30613', tc: '#fff' },
    },
    holstein_kiel: {
      csv: null, espn: ['Holstein Kiel', 'Kiel'], apifootball: ['Holstein Kiel', 'Kiel'],
      bsd: ['Holstein Kiel', 'Kiel', 'KSV Holstein Kiel'],
      footballdata: ['Holstein Kiel'],
      display: { name: 'Holstein Kiel', short: 'Kiel', abbr: 'KIE', color: '#003DA5', tc: '#fff' },
    },
    bochum: {
      csv: null, espn: ['VfL Bochum', 'Bochum'], apifootball: ['VfL Bochum 1848', 'Bochum', 'VfL Bochum'],
      bsd: ['VfL Bochum', 'Bochum', 'VfL Bochum 1848'],
      footballdata: ['Bochum', 'VfL Bochum'],
      display: { name: 'VfL Bochum', short: 'Bochum', abbr: 'BOC', color: '#005BA1', tc: '#fff' },
    },
    st_pauli: {
      csv: null, espn: ['FC St. Pauli', 'St. Pauli'], apifootball: ['FC St. Pauli', 'St. Pauli'],
      bsd: ['FC St. Pauli', 'St. Pauli', 'FC Sankt Pauli'],
      footballdata: ['St. Pauli', 'FC St. Pauli'],
      display: { name: 'FC St. Pauli', short: 'St. Pauli', abbr: 'STP', color: '#6F4420', tc: '#fff' },
    },
  },
  defaultHome: 'bayern',
  defaultAway: 'dortmund',
  dataFile: 'bundesliga-data.js',
};
