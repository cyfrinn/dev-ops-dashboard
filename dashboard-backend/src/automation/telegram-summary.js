require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const Task = require('../models/Task');

const connectDB = require('../config/database');

// Get Telegram bot token from OpenClaw config (should be set in .env or config)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8568807515:AAENokfIsOVmmxsVUQRcwKDotGVvvTUPuFI';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '5953902999'; // Stephen's chat ID

const sendTelegramSummary = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB for Telegram summary');

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch new opportunities from last 24 hours
    const newOpportunities = await Opportunity.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ relevance: -1 }).limit(5);

    // Fetch pending tasks
    const pendingTasks = await Task.find({ completed: false }).sort({ priority: -1, createdAt: -1 }).limit(3);

    // Build message
    let message = `🌅 *Good morning, Stephen!*\n\n`;
    message += `📊 *Your Daily Dashboard Brief*\n`;
    message += `📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n\n`;

    message += `🔥 *New Opportunities (${newOpportunities.length})*\n`;
    if (newOpportunities.length > 0) {
      newOpportunities.forEach((opp, idx) => {
        const catIcon = opp.category === 'job' ? '💼' : opp.category === 'saas' ? '🚀' : '💡';
        message += `${idx + 1}. ${catIcon} *${opp.title}*\n`;
        message += `   ${opp.source} • Relevance: ${opp.relevance}%\n`;
        if (opp.url) message += `   🔗 ${opp.url}\n`;
      });
    } else {
      message += `No new opportunities found. Check dashboard for latest.\n`;
    }

    message += `\n📝 *Top Pending Tasks*\n`;
    if (pendingTasks.length > 0) {
      pendingTasks.forEach((task, idx) => {
        const priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
        message += `${idx + 1}. ${priorityIcon} ${task.title}\n`;
      });
    } else {
      message += `All tasks complete! 🎉\n`;
    }

    message += `\n👉 View your full dashboard: https://dev-ops-dashboard-lw8n.vercel.app/\n`;
    message += `💡 Stay consistent. Keep building. Level up.`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(telegramUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log('📨 Telegram summary sent');
    process.exit(0);
  } catch (error) {
    console.error('❌ Telegram summary failed:', error.message);
    process.exit(1);
  }
};

sendTelegramSummary();
