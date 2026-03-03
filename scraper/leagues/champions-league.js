// UEFA Champions League configuration
export default {
  id: 'champions-league',
  name: 'Champions League',
  shortName: 'UCL',
  espn: { slug: 'uefa.champions' },
  apifootball: null,
  bsd: { leagueId: 7 },
  footballdata: { competitionCode: 'CL' },
  footballcsv: null,
  tournament: {
    type: 'annual',
    currentSeasonTournaments: 1,
    determineCutoffDate(matches) {
      if (matches.length === 0) return '2024-09-01';
      const dates = matches.map(m => m.date).sort();
      const newestDate = dates[dates.length - 1];
      const newestYear = parseInt(newestDate.slice(0, 4));
      const newestMonth = parseInt(newestDate.slice(5, 7));
      // UCL season runs Sep-May
      if (newestMonth >= 7) return `${newestYear}-07-01`;
      return `${newestYear - 1}-07-01`;
    },
    currentLabel: '2024-25',
    standingsTitle: 'Champions League — 2024-25',
  },
  standingsZones: [
    { range: [1, 8], color: 'var(--ag)', label: 'Round of 16 (1-8)' },
    { range: [9, 24], color: 'var(--ab)', label: 'Playoff (9-24)' },
    { range: [25, 36], color: 'var(--ar)', label: 'Eliminated (25-36)' },
  ],
  teams: {
    arsenal: {
      csv: null, espn: ['Arsenal'], bsd: ['Arsenal', 'Arsenal FC'],
      apifootball: ['Arsenal'],
      footballdata: ['Arsenal'],
      display: { name: 'Arsenal', short: 'Arsenal', abbr: 'ARS', color: '#EF0107', tc: '#fff' },
    },
    bayern_munich: {
      csv: null, espn: ['Bayern Munich', 'Bayern München', 'FC Bayern Munich'], bsd: ['Bayern Munich', 'FC Bayern Munich', 'Bayern München'],
      apifootball: ['Bayern Munich'],
      footballdata: ['Bayern', 'FC Bayern München'],
      display: { name: 'Bayern Munich', short: 'Bayern', abbr: 'BAY', color: '#DC052D', tc: '#fff' },
    },
    liverpool: {
      csv: null, espn: ['Liverpool'], bsd: ['Liverpool', 'Liverpool FC'],
      apifootball: ['Liverpool'],
      footballdata: ['Liverpool'],
      display: { name: 'Liverpool', short: 'Liverpool', abbr: 'LIV', color: '#C8102E', tc: '#fff' },
    },
    tottenham: {
      csv: null, espn: ['Tottenham Hotspur', 'Tottenham'], bsd: ['Tottenham Hotspur', 'Tottenham', 'Spurs'],
      apifootball: ['Tottenham Hotspur'],
      footballdata: ['Tottenham', 'Spurs'],
      display: { name: 'Tottenham Hotspur', short: 'Tottenham', abbr: 'TOT', color: '#132257', tc: '#fff' },
    },
    barcelona: {
      csv: null, espn: ['Barcelona', 'FC Barcelona'], bsd: ['Barcelona', 'FC Barcelona'],
      apifootball: ['Barcelona'],
      footballdata: ['Barcelona', 'Barça'],
      display: { name: 'FC Barcelona', short: 'Barcelona', abbr: 'BAR', color: '#A50044', tc: '#fff' },
    },
    chelsea: {
      csv: null, espn: ['Chelsea'], bsd: ['Chelsea', 'Chelsea FC'],
      apifootball: ['Chelsea'],
      footballdata: ['Chelsea'],
      display: { name: 'Chelsea', short: 'Chelsea', abbr: 'CHE', color: '#034694', tc: '#fff' },
    },
    sporting_cp: {
      csv: null, espn: ['Sporting CP', 'Sporting Lisbon'], bsd: ['Sporting CP', 'Sporting Lisbon', 'Sporting'],
      apifootball: ['Sporting CP'],
      footballdata: ['Sporting CP'],
      display: { name: 'Sporting CP', short: 'Sporting', abbr: 'SCP', color: '#008849', tc: '#fff' },
    },
    man_city: {
      csv: null, espn: ['Manchester City', 'Man City'], bsd: ['Manchester City', 'Man City'],
      apifootball: ['Manchester City'],
      footballdata: ['Man City', 'Manchester City'],
      display: { name: 'Manchester City', short: 'Man City', abbr: 'MCI', color: '#6CABDD', tc: '#1a202c' },
    },
    real_madrid: {
      csv: null, espn: ['Real Madrid'], bsd: ['Real Madrid', 'Real Madrid CF'],
      apifootball: ['Real Madrid'],
      footballdata: ['Real Madrid'],
      display: { name: 'Real Madrid', short: 'Real Madrid', abbr: 'RMA', color: '#FEBE10', tc: '#1a202c' },
    },
    inter: {
      csv: null, espn: ['Internazionale', 'Inter Milan', 'Inter'], bsd: ['Inter Milan', 'Internazionale', 'Inter'],
      apifootball: ['Internazionale'],
      footballdata: ['Inter', 'Inter Milan'],
      display: { name: 'Inter Milan', short: 'Inter', abbr: 'INT', color: '#010E80', tc: '#fff' },
    },
    psg: {
      csv: null, espn: ['Paris Saint-Germain', 'PSG'], bsd: ['Paris Saint-Germain', 'PSG', 'Paris SG'],
      apifootball: ['Paris Saint-Germain'],
      footballdata: ['PSG', 'Paris SG'],
      display: { name: 'Paris Saint-Germain', short: 'PSG', abbr: 'PSG', color: '#004170', tc: '#fff' },
    },
    newcastle: {
      csv: null, espn: ['Newcastle United', 'Newcastle'], bsd: ['Newcastle United', 'Newcastle', 'Newcastle Utd'],
      apifootball: ['Newcastle United'],
      footballdata: ['Newcastle', 'Newcastle Utd'],
      display: { name: 'Newcastle United', short: 'Newcastle', abbr: 'NEW', color: '#241F20', tc: '#fff' },
    },
    juventus: {
      csv: null, espn: ['Juventus'], bsd: ['Juventus', 'Juventus FC'],
      apifootball: ['Juventus'],
      footballdata: ['Juventus'],
      display: { name: 'Juventus', short: 'Juventus', abbr: 'JUV', color: '#000000', tc: '#fff' },
    },
    atletico_madrid: {
      csv: null, espn: ['Atlético Madrid', 'Atletico Madrid', 'Atlético de Madrid'], bsd: ['Atletico Madrid', 'Atletico de Madrid', 'Atletico'],
      apifootball: ['Atlético Madrid'],
      footballdata: ['Atlético', 'Atletico Madrid'],
      display: { name: 'Atletico Madrid', short: 'Atletico', abbr: 'ATM', color: '#CE3524', tc: '#fff' },
    },
    atalanta: {
      csv: null, espn: ['Atalanta'], bsd: ['Atalanta', 'Atalanta BC'],
      apifootball: ['Atalanta'],
      footballdata: ['Atalanta'],
      display: { name: 'Atalanta', short: 'Atalanta', abbr: 'ATA', color: '#1D71B8', tc: '#fff' },
    },
    leverkusen: {
      csv: null, espn: ['Bayer Leverkusen', 'Leverkusen', 'Bayer 04 Leverkusen'], bsd: ['Bayer Leverkusen', 'Leverkusen', 'Bayer 04 Leverkusen'],
      apifootball: ['Bayer Leverkusen'],
      footballdata: ['Leverkusen', 'Bayer 04 Leverkusen'],
      display: { name: 'Bayer Leverkusen', short: 'Leverkusen', abbr: 'B04', color: '#E32221', tc: '#fff' },
    },
    dortmund: {
      csv: null, espn: ['Borussia Dortmund', 'Dortmund', 'BVB'], bsd: ['Borussia Dortmund', 'Dortmund', 'BVB'],
      apifootball: ['Borussia Dortmund'],
      footballdata: ['Dortmund', 'Borussia Dortmund'],
      display: { name: 'Borussia Dortmund', short: 'Dortmund', abbr: 'BVB', color: '#FDE100', tc: '#1a202c' },
    },
    olympiacos: {
      csv: null, espn: ['Olympiacos', 'Olympiacos Piraeus'], bsd: ['Olympiacos', 'Olympiacos Piraeus', 'Olympiakos'],
      apifootball: ['Olympiacos'],
      footballdata: ['Olympiacos'],
      display: { name: 'Olympiacos', short: 'Olympiacos', abbr: 'OLY', color: '#CC0000', tc: '#fff' },
    },
    brugge: {
      csv: null, espn: ['Club Brugge', 'Club Bruges'], bsd: ['Club Brugge', 'Club Bruges'],
      apifootball: ['Club Brugge'],
      footballdata: ['Club Brugge'],
      display: { name: 'Club Brugge', short: 'Brugge', abbr: 'BRU', color: '#005BA6', tc: '#fff' },
    },
    galatasaray: {
      csv: null, espn: ['Galatasaray'], bsd: ['Galatasaray', 'Galatasaray SK'],
      apifootball: ['Galatasaray'],
      footballdata: ['Galatasaray'],
      display: { name: 'Galatasaray', short: 'Galatasaray', abbr: 'GAL', color: '#FF6A00', tc: '#1a202c' },
    },
    monaco: {
      csv: null, espn: ['AS Monaco', 'Monaco'], bsd: ['AS Monaco', 'Monaco'],
      apifootball: ['AS Monaco'],
      footballdata: ['Monaco', 'AS Monaco'],
      display: { name: 'AS Monaco', short: 'Monaco', abbr: 'MON', color: '#C62828', tc: '#fff' },
    },
    qarabag: {
      csv: null, espn: ['FK Qarabag', 'Qarabag'], bsd: ['Qarabag', 'FK Qarabag', 'Qarabag FK'],
      apifootball: ['FK Qarabag'],
      footballdata: ['Qarabag', 'FK Qarabag'],
      display: { name: 'FK Qarabag', short: 'Qarabag', abbr: 'QAR', color: '#1a202c', tc: '#fff' },
    },
    bodo_glimt: {
      csv: null, espn: ['Bodo/Glimt', 'Bodø/Glimt'], bsd: ['Bodo/Glimt', 'Bodoe/Glimt', 'FK Bodoe/Glimt', 'Bodø/Glimt'],
      apifootball: ['Bodo/Glimt'],
      footballdata: ['Bodø/Glimt'],
      display: { name: 'Bodø/Glimt', short: 'Bodø/Glimt', abbr: 'BOD', color: '#FFD700', tc: '#1a202c' },
    },
    benfica: {
      csv: null, espn: ['Benfica', 'SL Benfica'], bsd: ['Benfica', 'SL Benfica'],
      apifootball: ['Benfica'],
      footballdata: ['Benfica', 'SL Benfica'],
      display: { name: 'SL Benfica', short: 'Benfica', abbr: 'SLB', color: '#E20613', tc: '#fff' },
    },
    marseille: {
      csv: null, espn: ['Marseille', 'Olympique de Marseille', 'Olympique Marseille'], bsd: ['Marseille', 'Olympique Marseille', 'Olympique de Marseille'],
      apifootball: ['Marseille'],
      footballdata: ['Marseille', 'Olympique Marseille'],
      display: { name: 'Olympique Marseille', short: 'Marseille', abbr: 'OLM', color: '#2FAEE0', tc: '#1a202c' },
    },
    pafos: {
      csv: null, espn: ['Pafos', 'Pafos FC'], bsd: ['Pafos', 'Pafos FC'],
      apifootball: ['Pafos'],
      footballdata: ['Pafos'],
      display: { name: 'Pafos FC', short: 'Pafos', abbr: 'PAF', color: '#1565C0', tc: '#fff' },
    },
    union_sg: {
      csv: null, espn: ['Union St.-Gilloise', 'Union SG', 'Royale Union Saint-Gilloise'], bsd: ['Union SG', 'Union Saint-Gilloise', 'Royale Union Saint-Gilloise'],
      apifootball: ['Union St.-Gilloise'],
      footballdata: ['Union SG', 'Union Saint-Gilloise'],
      display: { name: 'Union SG', short: 'Union SG', abbr: 'USG', color: '#F9E300', tc: '#1a202c' },
    },
    psv: {
      csv: null, espn: ['PSV Eindhoven', 'PSV'], bsd: ['PSV Eindhoven', 'PSV'],
      apifootball: ['PSV Eindhoven'],
      footballdata: ['PSV', 'PSV Eindhoven'],
      display: { name: 'PSV Eindhoven', short: 'PSV', abbr: 'PSV', color: '#ED1C24', tc: '#fff' },
    },
    athletic_club: {
      csv: null, espn: ['Athletic Club', 'Athletic Bilbao'], bsd: ['Athletic Club', 'Athletic Bilbao'],
      apifootball: ['Athletic Club'],
      footballdata: ['Athletic', 'Athletic Club'],
      display: { name: 'Athletic Club', short: 'Athletic', abbr: 'ATH', color: '#EE2523', tc: '#fff' },
    },
    napoli: {
      csv: null, espn: ['Napoli', 'SSC Napoli'], bsd: ['Napoli', 'SSC Napoli'],
      apifootball: ['Napoli'],
      footballdata: ['Napoli'],
      display: { name: 'SSC Napoli', short: 'Napoli', abbr: 'NAP', color: '#12A0D7', tc: '#1a202c' },
    },
    kobenhavn: {
      csv: null, espn: ['F.C. København', 'FC Copenhagen', 'København'], bsd: ['FC Copenhagen', 'Copenhagen', 'FC Kobenhavn', 'FC København'],
      apifootball: ['F.C. København'],
      footballdata: ['Copenhagen', 'FC København'],
      display: { name: 'FC Copenhagen', short: 'Copenhagen', abbr: 'FCK', color: '#041E42', tc: '#fff' },
    },
    ajax: {
      csv: null, espn: ['Ajax Amsterdam', 'Ajax', 'AFC Ajax'], bsd: ['Ajax', 'Ajax Amsterdam', 'AFC Ajax'],
      apifootball: ['Ajax Amsterdam'],
      footballdata: ['Ajax', 'AFC Ajax'],
      display: { name: 'Ajax Amsterdam', short: 'Ajax', abbr: 'AJA', color: '#C62828', tc: '#fff' },
    },
    frankfurt: {
      csv: null, espn: ['Eintracht Frankfurt', 'Frankfurt'], bsd: ['Eintracht Frankfurt', 'Frankfurt'],
      apifootball: ['Eintracht Frankfurt'],
      footballdata: ['Frankfurt', 'Eintracht Frankfurt'],
      display: { name: 'Eintracht Frankfurt', short: 'Frankfurt', abbr: 'SGE', color: '#E1000F', tc: '#fff' },
    },
    slavia_prague: {
      csv: null, espn: ['Slavia Prague', 'Slavia Praha'], bsd: ['Slavia Prague', 'Slavia Praha'],
      apifootball: ['Slavia Prague'],
      footballdata: ['Slavia Prague'],
      display: { name: 'Slavia Prague', short: 'Slavia', abbr: 'SLA', color: '#CC0000', tc: '#fff' },
    },
    villarreal: {
      csv: null, espn: ['Villarreal', 'Villarreal CF'], bsd: ['Villarreal', 'Villarreal CF'],
      apifootball: ['Villarreal'],
      footballdata: ['Villarreal'],
      display: { name: 'Villarreal CF', short: 'Villarreal', abbr: 'VIL', color: '#FFCD00', tc: '#1a202c' },
    },
    kairat_almaty: {
      csv: null, espn: ['Kairat Almaty', 'FK Kairat'], bsd: ['Kairat Almaty', 'FK Kairat'],
      apifootball: ['Kairat Almaty'],
      footballdata: ['Kairat Almaty'],
      display: { name: 'Kairat Almaty', short: 'Kairat', abbr: 'KAI', color: '#FFCD00', tc: '#1a202c' },
    },
  },
  defaultHome: 'real_madrid',
  defaultAway: 'barcelona',
  dataFile: 'champions-league-data.js',
};
