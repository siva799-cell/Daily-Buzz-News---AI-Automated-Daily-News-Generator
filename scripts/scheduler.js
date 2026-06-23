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

// Target Time: June 24, 2026 12:00 AM IST (+05:30)
const TARGET_TIME = new Date('2026-06-24T00:00:00+05:30');
console.log(`Current Time: ${new Date().toString()}`);
console.log(`Target Start Time: ${TARGET_TIME.toString()}`);

async function triggerScraper() {
  console.log(`[${new Date().toLocaleString()}] Triggering news scraper...`);
  
  const req = http.get(CRON_URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
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

function startRecursiveScheduler() {
  console.log(`[${new Date().toLocaleString()}] Recursive scraper cycle started (Running every 24 hours).`);
  // Run immediately when scheduled time hits
  triggerScraper();
  
  // Set interval for every 24 hours
  const INTERVAL_24H = 24 * 60 * 60 * 1000;
  setInterval(() => {
    console.log(`[${new Date().toLocaleString()}] Scheduled 24-hour scraper trigger.`);
    triggerScraper();
  }, INTERVAL_24H);
}

const delay = TARGET_TIME.getTime() - Date.now();

if (delay > 0) {
  console.log(`Waiting for scheduled start time: ${TARGET_TIME.toLocaleString()}`);
  console.log(`Time remaining: ${Math.round(delay / 1000 / 60)} minutes (${Math.round(delay / 1000)} seconds)...`);
  
  setTimeout(() => {
    console.log(`[${new Date().toLocaleString()}] Scheduled target time reached!`);
    startRecursiveScheduler();
  }, delay);
} else {
  console.log(`Target time ${TARGET_TIME.toLocaleString()} is already in the past.`);
  console.log(`Starting recursive scheduler immediately.`);
  startRecursiveScheduler();
}
