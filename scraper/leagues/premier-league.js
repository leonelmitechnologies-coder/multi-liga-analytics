// Premier League (England) configuration
export default {
  id: 'premier-league',
  name: 'Premier League',
  shortName: 'Premier',
  espn: { slug: 'eng.1' },
  apifootball: { leagueId: 39, seasons: [2022, 2023, 2024] },
  bsd: { leagueId: 1 },
  footballdata: { competitionCode: 'PL' },
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
    standingsTitle: 'Premier League — 2024-25',
  },
  standingsZones: [
    { range: [1, 4], color: 'var(--ag)', label: 'Champions League (1-4)' },
    { range: [5, 5], color: 'var(--ab)', label: 'Europa League (5)' },
    { range: [6, 7], color: 'var(--ap)', label: 'Conference League (6-7)' },
    { range: [18, 20], color: 'var(--ar)', label: 'Relegation (18-20)' },
  ],
  teams: {
    arsenal: {
      csv: null, espn: ['Arsenal'], apifootball: ['Arsenal'], bsd: ['Arsenal', 'Arsenal FC'], footballdata: ['Arsenal'],
      display: { name: 'Arsenal', short: 'Arsenal', abbr: 'ARS', color: '#EF0107', tc: '#fff' },
    },
    aston_villa: {
      csv: null, espn: ['Aston Villa'], apifootball: ['Aston Villa'], bsd: ['Aston Villa', 'Aston Villa FC'], footballdata: ['Aston Villa'],
      display: { name: 'Aston Villa', short: 'Aston Villa', abbr: 'AVL', color: '#670E36', tc: '#fff' },
    },
    bournemouth: {
      csv: null, espn: ['Bournemouth', 'AFC Bournemouth'], apifootball: ['Bournemouth', 'AFC Bournemouth'], bsd: ['AFC Bournemouth', 'Bournemouth'], footballdata: ['Bournemouth', 'AFC Bournemouth'],
      display: { name: 'AFC Bournemouth', short: 'Bournemouth', abbr: 'BOU', color: '#DA291C', tc: '#fff' },
    },
    brentford: {
      csv: null, espn: ['Brentford', 'Brentford FC'], apifootball: ['Brentford', 'Brentford FC'], bsd: ['Brentford', 'Brentford FC'], footballdata: ['Brentford'],
      display: { name: 'Brentford', short: 'Brentford', abbr: 'BRE', color: '#E30613', tc: '#fff' },
    },
    brighton: {
      csv: null, espn: ['Brighton & Hove Albion', 'Brighton', 'Brighton and Hove Albion'], apifootball: ['Brighton', 'Brighton & Hove Albion'], bsd: ['Brighton & Hove Albion', 'Brighton', 'Brighton and Hove Albion'], footballdata: ['Brighton', 'Brighton Hove'],
      display: { name: 'Brighton & Hove Albion', short: 'Brighton', abbr: 'BHA', color: '#0057B8', tc: '#fff' },
    },
    chelsea: {
      csv: null, espn: ['Chelsea'], apifootball: ['Chelsea'], bsd: ['Chelsea', 'Chelsea FC'], footballdata: ['Chelsea'],
      display: { name: 'Chelsea', short: 'Chelsea', abbr: 'CHE', color: '#034694', tc: '#fff' },
    },
    crystal_palace: {
      csv: null, espn: ['Crystal Palace'], apifootball: ['Crystal Palace'], bsd: ['Crystal Palace', 'Crystal Palace FC'], footballdata: ['Crystal Palace'],
      display: { name: 'Crystal Palace', short: 'C. Palace', abbr: 'CRY', color: '#1B458F', tc: '#fff' },
    },
    everton: {
      csv: null, espn: ['Everton'], apifootball: ['Everton'], bsd: ['Everton', 'Everton FC'], footballdata: ['Everton'],
      display: { name: 'Everton', short: 'Everton', abbr: 'EVE', color: '#003399', tc: '#fff' },
    },
    fulham: {
      csv: null, espn: ['Fulham', 'Fulham FC'], apifootball: ['Fulham', 'Fulham FC'], bsd: ['Fulham', 'Fulham FC'], footballdata: ['Fulham'],
      display: { name: 'Fulham', short: 'Fulham', abbr: 'FUL', color: '#000000', tc: '#fff' },
    },
    ipswich: {
      csv: null, espn: ['Ipswich Town'], apifootball: ['Ipswich', 'Ipswich Town'], bsd: ['Ipswich Town', 'Ipswich'], footballdata: ['Ipswich', 'Ipswich Town'],
      display: { name: 'Ipswich Town', short: 'Ipswich', abbr: 'IPS', color: '#3A64A3', tc: '#fff' },
    },
    leicester: {
      csv: null, espn: ['Leicester City', 'Leicester'], apifootball: ['Leicester', 'Leicester City'], bsd: ['Leicester City', 'Leicester'], footballdata: ['Leicester', 'Leicester City'],
      display: { name: 'Leicester City', short: 'Leicester', abbr: 'LEI', color: '#003090', tc: '#fff' },
    },
    liverpool: {
      csv: null, espn: ['Liverpool'], apifootball: ['Liverpool'], bsd: ['Liverpool', 'Liverpool FC'], footballdata: ['Liverpool'],
      display: { name: 'Liverpool', short: 'Liverpool', abbr: 'LIV', color: '#C8102E', tc: '#fff' },
    },
    man_city: {
      csv: null, espn: ['Manchester City', 'Man City'], apifootball: ['Manchester City'], bsd: ['Manchester City', 'Man City'], footballdata: ['Man City', 'Manchester City'],
      display: { name: 'Manchester City', short: 'Man City', abbr: 'MCI', color: '#6CABDD', tc: '#1a202c' },
    },
    man_united: {
      csv: null, espn: ['Manchester United', 'Man United'], apifootball: ['Manchester United'], bsd: ['Manchester United', 'Man United'], footballdata: ['Man United', 'Manchester Utd'],
      display: { name: 'Manchester United', short: 'Man United', abbr: 'MUN', color: '#DA291C', tc: '#fff' },
    },
    newcastle: {
      csv: null, espn: ['Newcastle United', 'Newcastle'], apifootball: ['Newcastle', 'Newcastle United'], bsd: ['Newcastle United', 'Newcastle'], footballdata: ['Newcastle', 'Newcastle Utd'],
      display: { name: 'Newcastle United', short: 'Newcastle', abbr: 'NEW', color: '#241F20', tc: '#fff' },
    },
    nott_forest: {
      csv: null, espn: ['Nottingham Forest', "Nott'ham Forest"], apifootball: ['Nottingham Forest'], bsd: ['Nottingham Forest', "Nott'ham Forest"], footballdata: ["Nott'm Forest", 'Nottingham Forest'],
      display: { name: 'Nottingham Forest', short: 'Nott. Forest', abbr: 'NFO', color: '#DD0000', tc: '#fff' },
    },
    southampton: {
      csv: null, espn: ['Southampton'], apifootball: ['Southampton'], bsd: ['Southampton', 'Southampton FC'], footballdata: ['Southampton'],
      display: { name: 'Southampton', short: 'Southampton', abbr: 'SOU', color: '#D71920', tc: '#fff' },
    },
    tottenham: {
      csv: null, espn: ['Tottenham Hotspur', 'Tottenham'], apifootball: ['Tottenham', 'Tottenham Hotspur'], bsd: ['Tottenham Hotspur', 'Tottenham', 'Spurs'], footballdata: ['Tottenham', 'Spurs'],
      display: { name: 'Tottenham Hotspur', short: 'Tottenham', abbr: 'TOT', color: '#132257', tc: '#fff' },
    },
    west_ham: {
      csv: null, espn: ['West Ham United', 'West Ham'], apifootball: ['West Ham', 'West Ham United'], bsd: ['West Ham United', 'West Ham'], footballdata: ['West Ham', 'West Ham United'],
      display: { name: 'West Ham United', short: 'West Ham', abbr: 'WHU', color: '#7A263A', tc: '#fff' },
    },
    wolves: {
      csv: null, espn: ['Wolverhampton Wanderers', 'Wolves'], apifootball: ['Wolverhampton', 'Wolves', 'Wolverhampton Wanderers'], bsd: ['Wolverhampton Wanderers', 'Wolves', 'Wolverhampton'], footballdata: ['Wolverhampton', 'Wolves'],
      display: { name: 'Wolverhampton', short: 'Wolves', abbr: 'WOL', color: '#FDB913', tc: '#1a202c' },
    },
  },
  defaultHome: 'liverpool',
  defaultAway: 'man_city',
  dataFile: 'premier-league-data.js',
};
