// MLS (Major League Soccer) configuration
export default {
  id: 'mls',
  name: 'MLS',
  shortName: 'MLS',
  espn: { slug: 'usa.1' },
  apifootball: { leagueId: 253, seasons: [2023, 2024, 2025] },
  bsd: null,
  footballdata: null,
  footballcsv: null,
  tournament: {
    type: 'annual',
    currentSeasonTournaments: 1,
    // MLS runs Feb-Dec (calendar year)
    determineCutoffDate(matches) {
      if (matches.length === 0) return '2025-02-01';
      const dates = matches.map(m => m.date).sort();
      const newestDate = dates[dates.length - 1];
      const newestYear = parseInt(newestDate.slice(0, 4));
      const newestMonth = parseInt(newestDate.slice(5, 7));

      // Count matches in current year to detect early-season
      const matchesThisYear = dates.filter(d => d >= `${newestYear}-02-01`).length;
      if (matchesThisYear < 60) {
        // Early season — include prior year from June for enough data
        return `${newestYear - 1}-06-01`;
      }
      // Full season underway
      if (newestMonth >= 2) return `${newestYear}-02-01`;
      return `${newestYear - 1}-02-01`;
    },
    currentLabel: '2026',
    standingsTitle: 'MLS — 2026',
  },
  standingsZones: [
    { range: [1, 1], color: 'var(--ag)', label: "Supporters' Shield (1)" },
    { range: [2, 9], color: 'var(--ab)', label: 'Playoffs (2-9)' },
  ],
  teams: {
    atlanta_united: {
      csv: null, espn: ['Atlanta United FC', 'Atlanta United'], apifootball: ['Atlanta United', 'Atlanta United FC'],
      display: { name: 'Atlanta United FC', short: 'Atlanta', abbr: 'ATL', color: '#80000A', tc: '#fff' },
    },
    austin: {
      csv: null, espn: ['Austin FC'], apifootball: ['Austin FC'],
      display: { name: 'Austin FC', short: 'Austin', abbr: 'ATX', color: '#00B140', tc: '#fff' },
    },
    charlotte: {
      csv: null, espn: ['Charlotte FC'], apifootball: ['Charlotte FC'],
      display: { name: 'Charlotte FC', short: 'Charlotte', abbr: 'CLT', color: '#1A85C8', tc: '#fff' },
    },
    chicago_fire: {
      csv: null, espn: ['Chicago Fire FC', 'Chicago Fire'], apifootball: ['Chicago Fire', 'Chicago Fire FC'],
      display: { name: 'Chicago Fire FC', short: 'Chicago', abbr: 'CHI', color: '#C2032F', tc: '#fff' },
    },
    cincinnati: {
      csv: null, espn: ['FC Cincinnati', 'Cincinnati'], apifootball: ['FC Cincinnati', 'Cincinnati'],
      display: { name: 'FC Cincinnati', short: 'Cincinnati', abbr: 'CIN', color: '#F05323', tc: '#fff' },
    },
    colorado_rapids: {
      csv: null, espn: ['Colorado Rapids'], apifootball: ['Colorado Rapids'],
      display: { name: 'Colorado Rapids', short: 'Colorado', abbr: 'COL', color: '#862633', tc: '#fff' },
    },
    columbus_crew: {
      csv: null, espn: ['Columbus Crew'], apifootball: ['Columbus Crew'],
      display: { name: 'Columbus Crew', short: 'Columbus', abbr: 'CLB', color: '#000000', tc: '#FEDD00' },
    },
    dallas: {
      csv: null, espn: ['FC Dallas', 'Dallas'], apifootball: ['FC Dallas', 'Dallas'],
      display: { name: 'FC Dallas', short: 'Dallas', abbr: 'DAL', color: '#BF0D3E', tc: '#fff' },
    },
    dc_united: {
      csv: null, espn: ['D.C. United', 'DC United'], apifootball: ['D.C. United', 'DC United'],
      display: { name: 'D.C. United', short: 'D.C. United', abbr: 'DC', color: '#000000', tc: '#fff' },
    },
    houston_dynamo: {
      csv: null, espn: ['Houston Dynamo FC', 'Houston Dynamo'], apifootball: ['Houston Dynamo', 'Houston Dynamo FC'],
      display: { name: 'Houston Dynamo FC', short: 'Houston', abbr: 'HOU', color: '#F68712', tc: '#1a202c' },
    },
    inter_miami: {
      csv: null, espn: ['Inter Miami CF', 'Inter Miami'], apifootball: ['Inter Miami', 'Inter Miami CF'],
      display: { name: 'Inter Miami CF', short: 'Inter Miami', abbr: 'MIA', color: '#F7B5CD', tc: '#1a202c' },
    },
    la_galaxy: {
      csv: null, espn: ['LA Galaxy'], apifootball: ['LA Galaxy', 'Los Angeles Galaxy'],
      display: { name: 'LA Galaxy', short: 'LA Galaxy', abbr: 'LA', color: '#00245D', tc: '#fff' },
    },
    lafc: {
      csv: null, espn: ['LAFC', 'Los Angeles FC'], apifootball: ['Los Angeles FC', 'LAFC'],
      display: { name: 'LAFC', short: 'LAFC', abbr: 'LAFC', color: '#C39E6D', tc: '#1a202c' },
    },
    minnesota_united: {
      csv: null, espn: ['Minnesota United FC', 'Minnesota United'], apifootball: ['Minnesota United', 'Minnesota United FC'],
      display: { name: 'Minnesota United FC', short: 'Minnesota', abbr: 'MIN', color: '#E4E5E6', tc: '#1a202c' },
    },
    cf_montreal: {
      csv: null, espn: ['CF Montréal', 'CF Montreal', 'Montreal'], apifootball: ['CF Montreal', 'CF Montréal'],
      display: { name: 'CF Montréal', short: 'Montréal', abbr: 'MTL', color: '#000000', tc: '#fff' },
    },
    nashville_sc: {
      csv: null, espn: ['Nashville SC'], apifootball: ['Nashville SC'],
      display: { name: 'Nashville SC', short: 'Nashville', abbr: 'NSH', color: '#ECE83A', tc: '#1a202c' },
    },
    new_england: {
      csv: null, espn: ['New England Revolution', 'New England'], apifootball: ['New England Revolution', 'New England Rev.'],
      display: { name: 'New England Revolution', short: 'N. England', abbr: 'NE', color: '#0A2240', tc: '#fff' },
    },
    ny_red_bulls: {
      csv: null, espn: ['Red Bull New York', 'New York Red Bulls', 'NY Red Bulls'], apifootball: ['New York Red Bulls', 'Red Bull New York'],
      display: { name: 'New York Red Bulls', short: 'NY Red Bulls', abbr: 'RBNY', color: '#ED1E36', tc: '#fff' },
    },
    nycfc: {
      csv: null, espn: ['New York City FC', 'NYCFC'], apifootball: ['New York City FC', 'NYCFC'],
      display: { name: 'New York City FC', short: 'NYCFC', abbr: 'NYC', color: '#6CACE4', tc: '#1a202c' },
    },
    orlando_city: {
      csv: null, espn: ['Orlando City SC', 'Orlando City'], apifootball: ['Orlando City', 'Orlando City SC'],
      display: { name: 'Orlando City SC', short: 'Orlando', abbr: 'ORL', color: '#633492', tc: '#fff' },
    },
    philadelphia_union: {
      csv: null, espn: ['Philadelphia Union'], apifootball: ['Philadelphia Union'],
      display: { name: 'Philadelphia Union', short: 'Philadelphia', abbr: 'PHI', color: '#071B2C', tc: '#fff' },
    },
    portland_timbers: {
      csv: null, espn: ['Portland Timbers'], apifootball: ['Portland Timbers'],
      display: { name: 'Portland Timbers', short: 'Portland', abbr: 'POR', color: '#004812', tc: '#fff' },
    },
    real_salt_lake: {
      csv: null, espn: ['Real Salt Lake'], apifootball: ['Real Salt Lake'],
      display: { name: 'Real Salt Lake', short: 'Salt Lake', abbr: 'RSL', color: '#B30838', tc: '#fff' },
    },
    san_diego: {
      csv: null, espn: ['San Diego FC', 'San Diego'], apifootball: ['San Diego FC'],
      display: { name: 'San Diego FC', short: 'San Diego', abbr: 'SD', color: '#2A2D34', tc: '#fff' },
    },
    san_jose: {
      csv: null, espn: ['San Jose Earthquakes', 'San Jose'], apifootball: ['San Jose Earthquakes'],
      display: { name: 'San Jose Earthquakes', short: 'San Jose', abbr: 'SJ', color: '#0067B1', tc: '#fff' },
    },
    seattle_sounders: {
      csv: null, espn: ['Seattle Sounders FC', 'Seattle Sounders'], apifootball: ['Seattle Sounders', 'Seattle Sounders FC'],
      display: { name: 'Seattle Sounders FC', short: 'Seattle', abbr: 'SEA', color: '#5D9741', tc: '#fff' },
    },
    sporting_kc: {
      csv: null, espn: ['Sporting Kansas City', 'Sporting KC'], apifootball: ['Sporting Kansas City', 'Sporting KC'],
      display: { name: 'Sporting Kansas City', short: 'Sporting KC', abbr: 'SKC', color: '#002F65', tc: '#fff' },
    },
    st_louis: {
      csv: null, espn: ['St. Louis CITY SC', 'St. Louis City SC', 'St. Louis City'], apifootball: ['St. Louis City SC'],
      display: { name: 'St. Louis CITY SC', short: 'St. Louis', abbr: 'STL', color: '#C8102E', tc: '#fff' },
    },
    toronto: {
      csv: null, espn: ['Toronto FC', 'Toronto'], apifootball: ['Toronto FC'],
      display: { name: 'Toronto FC', short: 'Toronto', abbr: 'TOR', color: '#B81137', tc: '#fff' },
    },
    vancouver: {
      csv: null, espn: ['Vancouver Whitecaps', 'Vancouver Whitecaps FC'], apifootball: ['Vancouver Whitecaps', 'Vancouver Whitecaps FC'],
      display: { name: 'Vancouver Whitecaps', short: 'Vancouver', abbr: 'VAN', color: '#00245E', tc: '#fff' },
    },
  },
  defaultHome: 'la_galaxy',
  defaultAway: 'lafc',
  dataFile: 'mls-data.js',
};
