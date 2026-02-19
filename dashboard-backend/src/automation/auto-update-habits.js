require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Habit = require('../models/Habit');

const connectDB = require('../config/database');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'cyfrinn';

const autoUpdateHabits = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB for habit auto-update');

    // Find the "Code Commits" habit
    const habit = await Habit.findOne({ name: 'Code Commits', category: 'coding' });
    if (!habit) {
      console.log('⚠️  "Code Commits" habit not found in database. Skipping.');
      process.exit(0);
    }

    // Check if already completed today
    const today = new Date().toDateString();
    if (habit.lastCompleted && new Date(habit.lastCompleted).toDateString() === today) {
      console.log('✅ Habit already completed today.');
      process.exit(0);
    }

    // Fetch today's commits from GitHub
    const since = new Date();
    since.setHours(0, 0, 0, 0); // Start of today

    try {
      const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/events`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          per_page: 100
        }
      });

      const events = response.data;
      const pushEvents = events.filter(event => event.type === 'PushEvent');

      // Check if any push event happened today
      const hasCommitToday = pushEvents.some(event => {
        const eventDate = new Date(event.created_at);
        return eventDate.toDateString() === today;
      });

      if (hasCommitToday) {
        // Mark habit as completed
        habit.lastCompleted = new Date();
        habit.currentStreak += 1;
        if (habit.currentStreak > habit.bestStreak) {
          habit.bestStreak = habit.currentStreak;
        }
        await habit.save();
        console.log(`✅ Code Commits habit completed! Streak: ${habit.currentStreak}`);
      } else {
        console.log('ℹ️  No commits found today. Habit remains incomplete.');
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error('❌ GitHub API rate limit or permission issue. Check token.');
      } else {
        console.error('❌ GitHub API error:', error.message);
      }
      // Don't fail the whole automation
      process.exit(0);
    }

    console.log('🎉 Habit auto-update complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Habit auto-update failed:', error.message);
    process.exit(1);
  }
};

autoUpdateHabits();
