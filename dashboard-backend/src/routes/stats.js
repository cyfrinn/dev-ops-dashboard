const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET GitHub stats for a user
router.get('/github/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const token = process.env.GITHUB_TOKEN;

    // Fetch user's repos
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos`, {
      headers: token ? { Authorization: `token ${token}` } : {}
    });

    const repos = reposResponse.data;

    // Calculate basic stats
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const totalCommits = 0; // Would need additional API calls per repo

    // Get contribution activity (simplified)
    const languages = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Sort languages by frequency
    const topLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, repos: count }));

    res.json({
      username,
      totalRepos: repos.length,
      totalStars,
      totalForks,
      topLanguages,
      note: 'For detailed commit history, additional API calls per repo needed with proper auth'
    });
  } catch (error) {
    console.error('GitHub API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch GitHub stats' });
  }
});

module.exports = router;
