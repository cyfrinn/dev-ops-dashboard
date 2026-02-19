require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');

const connectDB = require('../config/database');

// News sources configuration
const SOURCES = [
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/',
    selector: '.titleline > a',
    maxItems: 10,
    type: 'html'
  },
  {
    name: 'Indie Hackers',
    url: 'https://www.indiehackers.com/',
    selector: 'a[href*="/product/"], a[href*="/community/"]',
    maxItems: 10,
    type: 'html'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    maxItems: 10,
    type: 'rss',
    itemSelector: 'item',
    titlePath: 'title',
    linkPath: 'link'
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/feed',
    maxItems: 10,
    type: 'rss',
    itemSelector: 'item',
    titlePath: 'title',
    linkPath: 'link'
  }
];

const scrapeNews = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB for news scraping');

    let totalNew = 0;

    for (const source of SOURCES) {
      console.log(`🔍 Scraping ${source.name}...`);

      try {
        let items = [];

        if (source.type === 'rss') {
          // Parse RSS feed
          const response = await axios.get(source.url, {
            headers: { 'User-Agent': 'DashboardBot/1.0' },
            timeout: 15000
          });
          const parser = new (require('rss-parser'))();
          const feed = await parser.parseString(response.data);
          items = feed.items.slice(0, source.maxItems);
        } else if (source.type === 'json') {
          const response = await axios.get(source.url, {
            headers: { 'User-Agent': 'DashboardBot/1.0' },
            timeout: 15000
          });
          const json = response.data;
          const path = source.jsonPath || 'data';
          const parts = path.split('.');
          let current = json;
          for (const part of parts) {
            current = current ? current[part] : null;
            if (!current) break;
          }
          items = current || [];
        } else {
          // HTML scrape
          const response = await axios.get(source.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DashboardBot/1.0)' },
            timeout: 15000
          });
          const $ = cheerio.load(response.data);
          items = $(source.selector);
        }

        let newCount = 0;
        for (let i = 0; i < Math.min(items.length, source.maxItems); i++) {
          let title = '';
          let href = '';

          if (source.type === 'rss') {
            const item = items[i];
            title = item.title || '';
            href = item.link || '';
          } else if (source.type === 'json') {
            const item = items[i];
            const data = item.data || item;
            title = data.title || '';
            href = data.url || '';
          } else {
            const link = items[i];
            href = $(link).attr('href') || '';
            title = $(link).text().trim();
          }

          if (!href || !title) continue;

          // Normalize URL
          let url = href;
          if (!href.startsWith('http')) {
            const baseUrl = new URL(source.url);
            url = `${baseUrl.origin}${href.startsWith('/') ? '' : '/'}${href}`;
          }

          // Check if already exists
          const exists = await Opportunity.findOne({ url });
          if (!exists) {
            await Opportunity.create({
              title: title.substring(0, 200),
              source: source.name,
              category: determineCategory(title),
              relevance: calculateRelevance(title),
              date: new Date().toISOString().split('T')[0],
              url,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            });
            newCount++;
          }
        }

        console.log(`  ✅ ${source.name}: ${newCount} new opportunities`);
        totalNew += newCount;
      } catch (err) {
        console.error(`  ❌ Error scraping ${source.name}:`, err.message);
      }
    }

    console.log(`🎉 News scraping complete: ${totalNew} new opportunities added`);
    process.exit(0);
  } catch (error) {
    console.error('❌ News scraping failed:', error.message);
    process.exit(1);
  }
};

// Simple heuristic to categorize opportunity
const determineCategory = (title) => {
  const t = title.toLowerCase();
  if (t.includes('job') || t.includes('hiring') || t.includes('remote')) return 'job';
  if (t.includes('saas') || t.includes('product') || t.includes('startup')) return 'saas';
  if (t.includes('tool') || t.includes('library') || t.includes('framework')) return 'tool';
  return 'trend';
};

// Simple heuristic for relevance (0-100)
const calculateRelevance = (title) => {
  const t = title.toLowerCase();
  let score = 50; // base

  if (t.includes('ai') || t.includes('artificial intelligence')) score += 30;
  if (t.includes('developer') || t.includes('dev')) score += 20;
  if (t.includes('growth') || t.includes('marketing')) score += 15;
  if (t.includes('react') || t.includes('next.js') || t.includes('node')) score += 10;
  if (t.includes('startup') || t.includes('founder')) score += 10;

  return Math.min(100, score);
};

scrapeNews();
