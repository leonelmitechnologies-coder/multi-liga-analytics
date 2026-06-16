// World Cup 2026 Analytics - Initial Data
// Auto-generated on 2026-06-16
// Sources: ESPN, API-Football
// Matches: 0 (Tournament starts June 11, 2026)
// Teams: 22 (48 teams total when qualifying completes)

var TEAMS = {
  "mexico": {
    "name": "Mexico",
    "short": "Mexico",
    "abbr": "MEX",
    "color": "#006341",
    "tc": "#fff"
  },
  "usa": {
    "name": "United States",
    "short": "USA",
    "abbr": "USA",
    "color": "#002868",
    "tc": "#fff"
  },
  "canada": {
    "name": "Canada",
    "short": "Canada",
    "abbr": "CAN",
    "color": "#FF0000",
    "tc": "#fff"
  },
  "argentina": {
    "name": "Argentina",
    "short": "Argentina",
    "abbr": "ARG",
    "color": "#74ACDF",
    "tc": "#1a202c"
  },
  "brazil": {
    "name": "Brazil",
    "short": "Brazil",
    "abbr": "BRA",
    "color": "#009C3B",
    "tc": "#FFDF00"
  },
  "uruguay": {
    "name": "Uruguay",
    "short": "Uruguay",
    "abbr": "URU",
    "color": "#0038A8",
    "tc": "#fff"
  },
  "colombia": {
    "name": "Colombia",
    "short": "Colombia",
    "abbr": "COL",
    "color": "#FCD116",
    "tc": "#1a202c"
  },
  "chile": {
    "name": "Chile",
    "short": "Chile",
    "abbr": "CHI",
    "color": "#0039A6",
    "tc": "#fff"
  },
  "ecuador": {
    "name": "Ecuador",
    "short": "Ecuador",
    "abbr": "ECU",
    "color": "#FFDD00",
    "tc": "#1a202c"
  },
  "spain": {
    "name": "Spain",
    "short": "Spain",
    "abbr": "ESP",
    "color": "#AA151B",
    "tc": "#fff"
  },
  "germany": {
    "name": "Germany",
    "short": "Germany",
    "abbr": "GER",
    "color": "#000000",
    "tc": "#fff"
  },
  "france": {
    "name": "France",
    "short": "France",
    "abbr": "FRA",
    "color": "#0055A4",
    "tc": "#fff"
  },
  "england": {
    "name": "England",
    "short": "England",
    "abbr": "ENG",
    "color": "#FFFFFF",
    "tc": "#1a202c"
  },
  "portugal": {
    "name": "Portugal",
    "short": "Portugal",
    "abbr": "POR",
    "color": "#FF0000",
    "tc": "#fff"
  },
  "italy": {
    "name": "Italy",
    "short": "Italy",
    "abbr": "ITA",
    "color": "#0066CC",
    "tc": "#fff"
  },
  "netherlands": {
    "name": "Netherlands",
    "short": "Netherlands",
    "abbr": "NED",
    "color": "#FF4F00",
    "tc": "#fff"
  },
  "belgium": {
    "name": "Belgium",
    "short": "Belgium",
    "abbr": "BEL",
    "color": "#000000",
    "tc": "#FFCE00"
  },
  "japan": {
    "name": "Japan",
    "short": "Japan",
    "abbr": "JPN",
    "color": "#BC002D",
    "tc": "#fff"
  },
  "south_korea": {
    "name": "South Korea",
    "short": "S. Korea",
    "abbr": "KOR",
    "color": "#CD2E3A",
    "tc": "#fff"
  },
  "morocco": {
    "name": "Morocco",
    "short": "Morocco",
    "abbr": "MAR",
    "color": "#C1272D",
    "tc": "#fff"
  },
  "senegal": {
    "name": "Senegal",
    "short": "Senegal",
    "abbr": "SEN",
    "color": "#00853F",
    "tc": "#fff"
  }
};

var MATCHES = [
  // Matches will be populated as the tournament approaches and begins
  // Group stage: June 11 - June 26, 2026
  // Round of 32: June 28 - July 3, 2026
  // Round of 16: July 5 - 8, 2026
  // Quarterfinals: July 10 - 11, 2026
  // Semifinals: July 14 - 15, 2026
  // Third place: July 18, 2026
  // Final: July 19, 2026
];

var STANDINGS = [
  // Group stage standings will be populated once groups are drawn
  // Expected: 12 groups of 4 teams (48 teams total)
  // Top 2 from each group + 8 best third-place teams advance to Round of 32
];

var LIVE = {
  lastUpdate: null,
  matches: [],
  standings: []
};
