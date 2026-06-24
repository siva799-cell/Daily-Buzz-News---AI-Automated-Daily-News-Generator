import http from 'http';
import fs from 'fs';
import path from 'path';

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const parts = line.split('=');
    if (parts.length === 2) {
      process.env[parts[0].trim()] = parts[1].trim();
    }
  });
}

const PORT = process.env.PORT || 3000;
const CRON_URL = `http://localhost:${PORT}/api/cron/fetch-news`;

console.log('==================================================');
console.log('   DAILY BUZZ NEWS FACT AGGREGATOR LOCAL SCHEDULER    ');
console.log('==================================================');
console.log(`Target Scraper Endpoint: ${CRON_URL}`);

function getNextRunTime() {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(6, 0, 0, 0);

  if (now.getHours() > 6 || (now.getHours() === 6 && (now.getMinutes() > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0))) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun;
}

function scheduleNextRun() {
  const nextRunTime = getNextRunTime();
  const now = new Date();
  const isPastSix = now.getHours() > 6 || (now.getHours() === 6 && (now.getMinutes() > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0));

  if (isPastSix) {
    console.log(`[${now.toLocaleString()}] Current time is past 6:00 AM, so the update is running immediately.`);
    triggerScraper();
    setTimeout(scheduleNextRun, 60 * 1000);
    return;
  }

  const delay = nextRunTime.getTime() - Date.now();

  console.log(`Next scheduled update: ${nextRunTime.toLocaleString()}`);
  console.log(`Time remaining: ${Math.round(delay / 1000 / 60)} minutes (${Math.round(delay / 1000)} seconds)...`);

  setTimeout(() => {
    console.log(`[${new Date().toLocaleString()}] Scheduled 6:00 AM target reached!`);
    triggerScraper();
    scheduleNextRun();
  }, delay);
}

async function triggerScraper() {
  console.log(`[${new Date().toLocaleString()}] Triggering news scraper...`);

  const req = http.get(CRON_URL, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`[${new Date().toLocaleString()}] Scraper response status: ${res.statusCode}`);
      try {
        const parsed = JSON.parse(data);
        console.log(`[${new Date().toLocaleString()}] Scraper result:`, parsed);
      } catch (e) {
        console.log(`[${new Date().toLocaleString()}] Scraper raw response:`, data.substring(0, 200));
      }
    });
  });

  req.on('error', (err) => {
    console.error(`[${new Date().toLocaleString()}] Scraper connection error:`, err.message);
    console.log(`[${new Date().toLocaleString()}] Retrying in 30 seconds...`);
    setTimeout(triggerScraper, 30000);
  });
}

scheduleNextRun();
