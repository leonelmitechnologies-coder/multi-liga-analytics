// Serie A (Italy) configuration
export default {
  id: 'serie-a',
  name: 'Serie A',
  shortName: 'SerieA',
  espn: { slug: 'ita.1' },
  apifootball: { leagueId: 135, seasons: [2022, 2023, 2024] },
  bsd: { leagueId: 4 },
  footballdata: { competitionCode: 'SA' },
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
    standingsTitle: 'Serie A — 2024-25',
  },
  standingsZones: [
    { range: [1, 4], color: 'var(--ag)', label: 'Champions League (1-4)' },
    { range: [5, 6], color: 'var(--ab)', label: 'Europa League (5-6)' },
    { range: [7, 7], color: 'var(--ap)', label: 'Conference League (7)' },
    { range: [18, 20], color: 'var(--ar)', label: 'Retrocessione (18-20)' },
  ],
  teams: {
    ac_milan: {
      csv: null, espn: ['AC Milan', 'Milan'], apifootball: ['AC Milan', 'Milan'],
      bsd: ['AC Milan', 'Milan'],
      footballdata: ['Milan', 'AC Milan'],
      display: { name: 'AC Milan', short: 'Milan', abbr: 'MIL', color: '#FB090B', tc: '#fff' },
    },
    atalanta: {
      csv: null, espn: ['Atalanta', 'Atalanta BC'], apifootball: ['Atalanta'],
      bsd: ['Atalanta', 'Atalanta BC'],
      footballdata: ['Atalanta'],
      display: { name: 'Atalanta', short: 'Atalanta', abbr: 'ATA', color: '#1E71B8', tc: '#fff' },
    },
    bologna: {
      csv: null, espn: ['Bologna', 'Bologna FC'], apifootball: ['Bologna', 'Bologna FC 1909'],
      bsd: ['Bologna', 'Bologna FC 1909'],
      footballdata: ['Bologna'],
      display: { name: 'Bologna FC', short: 'Bologna', abbr: 'BOL', color: '#1A2F48', tc: '#fff' },
    },
    cagliari: {
      csv: null, espn: ['Cagliari', 'Cagliari Calcio'], apifootball: ['Cagliari'],
      bsd: ['Cagliari', 'Cagliari Calcio'],
      footballdata: ['Cagliari'],
      display: { name: 'Cagliari', short: 'Cagliari', abbr: 'CAG', color: '#A01E28', tc: '#fff' },
    },
    como: {
      csv: null, espn: ['Como', 'Como 1907'], apifootball: ['Como', 'Como 1907'],
      bsd: ['Como', 'Como 1907'],
      footballdata: ['Como', 'Como 1907'],
      display: { name: 'Como 1907', short: 'Como', abbr: 'COM', color: '#003DA5', tc: '#fff' },
    },
    empoli: {
      csv: null, espn: ['Empoli', 'Empoli FC'], apifootball: ['Empoli'],
      bsd: ['Empoli', 'Empoli FC'],
      footballdata: ['Empoli'],
      display: { name: 'Empoli', short: 'Empoli', abbr: 'EMP', color: '#005BA6', tc: '#fff' },
    },
    fiorentina: {
      csv: null, espn: ['Fiorentina', 'ACF Fiorentina'], apifootball: ['Fiorentina', 'ACF Fiorentina'],
      bsd: ['Fiorentina', 'ACF Fiorentina'],
      footballdata: ['Fiorentina'],
      display: { name: 'ACF Fiorentina', short: 'Fiorentina', abbr: 'FIO', color: '#482B83', tc: '#fff' },
    },
    genoa: {
      csv: null, espn: ['Genoa', 'Genoa CFC'], apifootball: ['Genoa', 'Genoa CFC'],
      bsd: ['Genoa', 'Genoa CFC'],
      footballdata: ['Genoa'],
      display: { name: 'Genoa CFC', short: 'Genoa', abbr: 'GEN', color: '#A41E35', tc: '#fff' },
    },
    hellas_verona: {
      csv: null, espn: ['Hellas Verona', 'Verona'], apifootball: ['Hellas Verona', 'Verona'],
      bsd: ['Hellas Verona', 'Verona'],
      footballdata: ['Verona', 'Hellas Verona'],
      display: { name: 'Hellas Verona', short: 'Verona', abbr: 'VER', color: '#1A3667', tc: '#FFE500' },
    },
    inter: {
      csv: null, espn: ['Inter Milan', 'Internazionale', 'Inter'], apifootball: ['Inter', 'Inter Milan', 'Internazionale'],
      bsd: ['Inter Milan', 'Internazionale', 'Inter'],
      footballdata: ['Inter', 'Inter Milan'],
      display: { name: 'Inter Milan', short: 'Inter', abbr: 'INT', color: '#010E80', tc: '#fff' },
    },
    juventus: {
      csv: null, espn: ['Juventus'], apifootball: ['Juventus'],
      bsd: ['Juventus', 'Juventus FC'],
      footballdata: ['Juventus'],
      display: { name: 'Juventus', short: 'Juventus', abbr: 'JUV', color: '#000000', tc: '#fff' },
    },
    lazio: {
      csv: null, espn: ['Lazio', 'SS Lazio'], apifootball: ['Lazio', 'SS Lazio'],
      bsd: ['Lazio', 'SS Lazio'],
      footballdata: ['Lazio'],
      display: { name: 'SS Lazio', short: 'Lazio', abbr: 'LAZ', color: '#87D8F7', tc: '#1a202c' },
    },
    lecce: {
      csv: null, espn: ['Lecce', 'US Lecce'], apifootball: ['Lecce', 'US Lecce'],
      bsd: ['Lecce', 'US Lecce'],
      footballdata: ['Lecce'],
      display: { name: 'US Lecce', short: 'Lecce', abbr: 'LEC', color: '#FFED00', tc: '#1a202c' },
    },
    monza: {
      csv: null, espn: ['Monza', 'AC Monza'], apifootball: ['Monza', 'AC Monza'],
      bsd: ['Monza', 'AC Monza'],
      footballdata: ['Monza'],
      display: { name: 'AC Monza', short: 'Monza', abbr: 'MON', color: '#CE0E2D', tc: '#fff' },
    },
    napoli: {
      csv: null, espn: ['Napoli', 'SSC Napoli'], apifootball: ['Napoli', 'SSC Napoli'],
      bsd: ['Napoli', 'SSC Napoli'],
      footballdata: ['Napoli'],
      display: { name: 'SSC Napoli', short: 'Napoli', abbr: 'NAP', color: '#12A0D7', tc: '#fff' },
    },
    parma: {
      csv: null, espn: ['Parma', 'Parma Calcio 1913'], apifootball: ['Parma', 'Parma Calcio 1913'],
      bsd: ['Parma', 'Parma Calcio 1913'],
      footballdata: ['Parma'],
      display: { name: 'Parma Calcio', short: 'Parma', abbr: 'PAR', color: '#FEDD00', tc: '#1a202c' },
    },
    roma: {
      csv: null, espn: ['Roma', 'AS Roma'], apifootball: ['AS Roma', 'Roma'],
      bsd: ['AS Roma', 'Roma'],
      footballdata: ['Roma', 'AS Roma'],
      display: { name: 'AS Roma', short: 'Roma', abbr: 'ROM', color: '#970A2C', tc: '#FFB800' },
    },
    torino: {
      csv: null, espn: ['Torino', 'Torino FC'], apifootball: ['Torino', 'Torino FC'],
      bsd: ['Torino', 'Torino FC'],
      footballdata: ['Torino'],
      display: { name: 'Torino FC', short: 'Torino', abbr: 'TOR', color: '#8B1A2D', tc: '#fff' },
    },
    udinese: {
      csv: null, espn: ['Udinese', 'Udinese Calcio'], apifootball: ['Udinese'],
      bsd: ['Udinese', 'Udinese Calcio'],
      footballdata: ['Udinese'],
      display: { name: 'Udinese', short: 'Udinese', abbr: 'UDI', color: '#000000', tc: '#fff' },
    },
    venezia: {
      csv: null, espn: ['Venezia', 'Venezia FC'], apifootball: ['Venezia', 'Venezia FC'],
      bsd: ['Venezia', 'Venezia FC'],
      footballdata: ['Venezia'],
      display: { name: 'Venezia FC', short: 'Venezia', abbr: 'VEN', color: '#F47B20', tc: '#1a202c' },
    },
  },
  defaultHome: 'inter',
  defaultAway: 'juventus',
  dataFile: 'serie-a-data.js',
};
