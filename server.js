// Multi-Liga Analytics — Local Development Server
// Serves static files + auto-updates data via scraper
// No external dependencies — uses only Node.js built-ins

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// ================= CONFIG =================
const ROOT = __dirname;
const SCRAPER_DIR = path.join(ROOT, 'scraper');
const DATA_DIR = path.join(ROOT, 'data');
const LOCK_FILE = path.join(SCRAPER_DIR, '.update-lock');
const STALE_MINUTES = 15;
const RECHECK_MS = STALE_MINUTES * 60 * 1000;
const PREFERRED_PORTS = [3000, 3001, 3002];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// ================= SCRAPER STATE =================
var scraperState = {
  running: false,
  startedAt: null,
  completedAt: null,
  lastResult: null,  // 'success' | 'error' | null
  process: null,
};

// ================= DATA FRESHNESS =================
function getDataTimestamps() {
  var timestamps = {};
  try {
    var files = fs.readdirSync(DATA_DIR).filter(function(f) { return f.endsWith('-data.js'); });
    files.forEach(function(file) {
      var leagueId = file.replace('-data.js', '');
      var filePath = path.join(DATA_DIR, file);
      var content = fs.readFileSync(filePath, 'utf8');
      var match = content.match(/"generated"\s*:\s*"([^"]+)"/);
      if (match) {
        timestamps[leagueId] = match[1];
      } else {
        // Fallback to file mtime
        var stat = fs.statSync(filePath);
        timestamps[leagueId] = stat.mtime.toISOString();
      }
    });
  } catch (e) { /* ignore */ }
  return timestamps;
}

function getDataAge() {
  var timestamps = getDataTimestamps();
  var keys = Object.keys(timestamps);
  if (!keys.length) return Infinity;
  var newest = Math.max.apply(null, keys.map(function(k) { return new Date(timestamps[k]).getTime(); }));
  return (Date.now() - newest) / 60000; // minutes
}

function isDataStale() {
  return getDataAge() > STALE_MINUTES;
}

// ================= SCRAPER RUNNER =================
function runScraper() {
  if (scraperState.running) return false;

  // Check external lock file (from Task Scheduler runs)
  if (fs.existsSync(LOCK_FILE)) {
    try {
      var lockAge = (Date.now() - fs.statSync(LOCK_FILE).mtimeMs) / 60000;
      if (lockAge < 30) {
        console.log('[server] Lock file exists (age: ' + Math.round(lockAge) + 'min), skipping update');
        return false;
      }
      // Stale lock (>30 min), remove it
      fs.unlinkSync(LOCK_FILE);
      console.log('[server] Removed stale lock file');
    } catch (e) { /* ignore */ }
  }

  scraperState.running = true;
  scraperState.startedAt = new Date().toISOString();
  scraperState.lastResult = null;

  console.log('[server] Starting scraper (full update with BSD + API-Football)...');

  // Create lock file
  try { fs.writeFileSync(LOCK_FILE, 'server-' + process.pid + '\n' + new Date().toISOString()); } catch (e) { /* ignore */ }

  // Parse API keys from .env.bat (gitignored secrets file)
  var env = Object.assign({}, process.env);
  try {
    var envBat = fs.readFileSync(path.join(SCRAPER_DIR, '.env.bat'), 'utf8');
    var m1 = envBat.match(/set BSD_API_KEY=(.+)/);
    var m2 = envBat.match(/set APIFOOTBALL_KEY=(.+)/);
    if (m1) env.BSD_API_KEY = m1[1].trim();
    if (m2) env.APIFOOTBALL_KEY = m2[1].trim();
  } catch (e) { /* .env.bat not found, run without keys */ }

  var child = spawn('node', ['index.js', '--league', 'all'], {
    cwd: SCRAPER_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: env,
    shell: false,
  });

  scraperState.process = child;

  child.stdout.on('data', function(data) {
    process.stdout.write('[scraper] ' + data.toString());
  });
  child.stderr.on('data', function(data) {
    process.stderr.write('[scraper:err] ' + data.toString());
  });

  child.on('close', function(code) {
    scraperState.running = false;
    scraperState.completedAt = new Date().toISOString();
    scraperState.lastResult = code === 0 ? 'success' : 'error';
    scraperState.process = null;

    // Remove lock file
    try { fs.unlinkSync(LOCK_FILE); } catch (e) { /* ignore */ }

    console.log('[server] Scraper finished with code ' + code);
  });

  child.on('error', function(err) {
    scraperState.running = false;
    scraperState.completedAt = new Date().toISOString();
    scraperState.lastResult = 'error';
    scraperState.process = null;
    try { fs.unlinkSync(LOCK_FILE); } catch (e) { /* ignore */ }
    console.error('[server] Scraper error:', err.message);
  });

  return true;
}

// ================= API HANDLERS =================
function handleAPI(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/api/update-status') {
    var age = getDataAge();
    res.end(JSON.stringify({
      running: scraperState.running,
      startedAt: scraperState.startedAt,
      completedAt: scraperState.completedAt,
      lastResult: scraperState.lastResult,
      dataAge: Math.round(age),
      stale: age > STALE_MINUTES,
    }));
    return true;
  }

  if (req.url === '/api/trigger-update') {
    var triggered = runScraper();
    res.end(JSON.stringify({ triggered: triggered, running: scraperState.running }));
    return true;
  }

  if (req.url === '/api/data-timestamps') {
    res.end(JSON.stringify(getDataTimestamps()));
    return true;
  }

  return false;
}

// ================= STATIC FILE SERVER =================
function serveStatic(req, res) {
  var urlPath = req.url.split('?')[0].split('#')[0];
  if (urlPath === '/') urlPath = '/index.html';

  // Prevent directory traversal
  var filePath = path.join(ROOT, decodeURIComponent(urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    var ext = path.extname(filePath).toLowerCase();
    var contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // No-cache for data files so frontend always gets fresh data
    if (urlPath.startsWith('/data/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// ================= REQUEST HANDLER =================
function onRequest(req, res) {
  // API routes
  if (req.url.startsWith('/api/')) {
    if (!handleAPI(req, res)) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Unknown API endpoint' }));
    }
    return;
  }

  // Static files
  serveStatic(req, res);
}

// ================= SERVER STARTUP =================
function tryListen(portIndex) {
  if (portIndex >= PREFERRED_PORTS.length) {
    console.error('[server] All ports occupied (' + PREFERRED_PORTS.join(', ') + '). Exiting.');
    process.exit(1);
  }

  var port = PREFERRED_PORTS[portIndex];
  var server = http.createServer(onRequest);

  server.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      console.log('[server] Port ' + port + ' in use, trying next...');
      tryListen(portIndex + 1);
    } else {
      console.error('[server] Server error:', err);
      process.exit(1);
    }
  });

  server.listen(port, function() {
    var url = 'http://localhost:' + port;
    console.log('');
    console.log('  Multi-Liga Analytics Server');
    console.log('  ' + url);
    console.log('');

    // Check data freshness and trigger update if needed
    var age = getDataAge();
    if (age === Infinity) {
      console.log('[server] No data files found. Run scraper manually first.');
    } else if (age > STALE_MINUTES) {
      console.log('[server] Data is ' + Math.round(age) + ' min old (>' + STALE_MINUTES + 'min). Triggering update...');
      runScraper();
    } else {
      console.log('[server] Data is fresh (' + Math.round(age) + ' min old).');
    }

    // Periodic recheck every 15 minutes
    setInterval(function() {
      if (isDataStale() && !scraperState.running) {
        console.log('[server] Periodic check: data is stale. Triggering update...');
        runScraper();
      }
    }, RECHECK_MS);

    // Auto-open browser
    try {
      execSync('start "" "' + url + '"', { stdio: 'ignore', shell: true });
    } catch (e) {
      console.log('[server] Could not open browser automatically. Open ' + url + ' manually.');
    }
  });
}

tryListen(0);
