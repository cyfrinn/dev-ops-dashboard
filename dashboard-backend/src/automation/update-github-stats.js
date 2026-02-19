require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Project = require('../models/Project');

// Connect to MongoDB
const connectDB = require('../config/database');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'cyfrinn'; // TODO: Make configurable later

const updateGitStats = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB for GitHub stats update');

    // Fetch user's repos
    const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 100
      }
    });

    const repos = response.data;
    console.log(`📊 Fetched ${repos.length} repos`);

    // Update projects in database that have matching repo URLs
    let updatedCount = 0;
    for (const repo of repos) {
      // Try to find a project with this repo URL
      const project = await Project.findOne({ repo: { $regex: repo.full_name, $options: 'i' } });

      if (project) {
        // Update project progress based on repo activity
        const daysSinceUpdate = (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
        const activityScore = Math.max(0, 100 - daysSinceUpdate * 10); // 100 = recent, 0 = 10 days ago

        project.progress = Math.min(100, Math.max(project.progress, activityScore));
        project.updatedAt = new Date();
        await project.save();
        updatedCount++;
        console.log(`  ↻ Updated project: ${project.name} (progress: ${Math.round(project.progress)}%)`);
      }
    }

    console.log(`✅ Updated ${updatedCount} projects`);
    console.log('🎉 GitHub stats update complete');

    process.exit(0);
  } catch (error) {
    console.error('❌ GitHub stats update failed:', error.message);
    process.exit(1);
  }
};

updateGitStats();
