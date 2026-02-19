const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SETTINGS_FILE = path.resolve(__dirname, '../../.env');

// GET current settings (sensitive values masked)
router.get('/', (req, res) => {
  try {
    // Read .env file if exists, otherwise use current env
    let envVars = { ...process.env };

    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const lines = content.split('\n');
      lines.forEach(line => {
        if (line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=');
          if (key && value) {
            envVars[key.trim()] = value.trim();
          }
        }
      });
    }

    // Return safe settings (mask sensitive tokens)
    res.json({
      github: {
        username: envVars.GITHUB_USERNAME || 'cyfrinn',
        token: envVars.GITHUB_TOKEN ? '••••••••••••••••' : null
      },
      telegram: {
        botToken: envVars.TELEGRAM_BOT_TOKEN ? '••••••••••••••••' : null,
        chatId: envVars.TELEGRAM_CHAT_ID || null
      },
      automation: {
        schedule: envVars.AUTOMATION_SCHEDULE || '0 18 * * *', // Default 2am PH
        enabled: envVars.AUTOMATION_ENABLED !== 'false' // Default true
      },
      mongodb: {
        uri: envVars.MONGODB_URI ? '••••••••••••••••' : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST save settings
router.post('/', (req, res) => {
  try {
    const settings = req.body;

    // Read existing .env
    let envContent = '';
    if (fs.existsSync(SETTINGS_FILE)) {
      envContent = fs.readFileSync(SETTINGS_FILE, 'utf8');
    }

    // Parse into object
    const env = {};
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        env[key.trim()] = valueParts.join('=').trim();
      }
    });

    // Update fields from request
    if (settings.github?.username) env.GITHUB_USERNAME = settings.github.username;
    if (settings.github?.token && settings.github.token !== '••••••••••••••••') {
      env.GITHUB_TOKEN = settings.github.token;
    }
    if (settings.telegram?.botToken && settings.telegram.botToken !== '••••••••••••••••') {
      env.TELEGRAM_BOT_TOKEN = settings.telegram.botToken;
    }
    if (settings.telegram?.chatId) env.TELEGRAM_CHAT_ID = settings.telegram.chatId;
    if (settings.automation?.schedule) env.AUTOMATION_SCHEDULE = settings.automation.schedule;
    if (typeof settings.automation?.enabled === 'boolean') {
      env.AUTOMATION_ENABLED = settings.automation.enabled ? 'true' : 'false';
    }

    // Write back to .env
    const newContent = Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n';
    fs.writeFileSync(SETTINGS_FILE, newContent, 'utf8');

    // Restart automation if needed (via PM2)
    const { exec } = require('child_process');
    exec('pm2 restart automation', (err) => {
      if (err) console.error('Failed to restart automation:', err);
    });

    res.json({ success: true, message: 'Settings saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
