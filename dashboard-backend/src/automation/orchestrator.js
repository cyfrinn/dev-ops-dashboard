require('dotenv').config();
const cron = require('node-cron');
const { spawn } = require('child_process');

// Schedule: Run every night at 2 AM Manila time (UTC+8)
// In UTC, that's 18:00 the previous day (since Manila is +8)
const CRON_SCHEDULE = '0 18 * * *'; // 18:00 UTC = 2:00 AM PH

console.log('🤖 Automation Orchestrator starting...');
console.log(`⏰ Schedule: Daily at 2:00 AM Manila time (UTC 18:00)`);

const runTask = (taskName, scriptPath) => {
  return new Promise((resolve, reject) => {
    console.log(`▶️  Starting task: ${taskName}`);
    const child = spawn('node', [scriptPath], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Task completed: ${taskName}`);
        resolve();
      } else {
        console.error(`❌ Task failed: ${taskName} (exit code ${code})`);
        reject(new Error(`${taskName} failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      console.error(`❌ Task error: ${taskName}`, err);
      reject(err);
    });
  });
};

// Main automation workflow
const runAutomation = async () => {
  console.log('\n🔄 Running nightly automation workflow...\n');

  try {
    // 1. Auto-update habits from GitHub
    await runTask('Auto-Update Habits', './src/automation/auto-update-habits.js');

    // 2. Update GitHub stats
    await runTask('Update GitHub Stats', './src/automation/update-github-stats.js');

    // 3. Scrape news/opportunities
    await runTask('Scrape News', './src/automation/scrape-news.js');

    // 4. Send Telegram summary
    await runTask('Send Telegram Summary', './src/automation/telegram-summary.js');

    console.log('\n🎉 All automation tasks completed successfully!');
  } catch (error) {
    console.error('\n❌ Automation workflow failed:', error.message);
    process.exit(1);
  }
};

// Schedule the job
cron.schedule(CRON_SCHEDULE, () => {
  console.log(`\n⏰ Scheduled automation triggered at ${new Date().toISOString()}`);
  runAutomation();
});

console.log('🤖 Orchestrator is running. Waiting for next scheduled run...\n');

// Also run immediately on start for testing (optional)
// runAutomation();
