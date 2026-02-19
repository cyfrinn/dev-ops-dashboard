require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/Task');
const Habit = require('./models/Habit');
const Project = require('./models/Project');
const LearningItem = require('./models/LearningItem');
const Opportunity = require('./models/Opportunity');

const seedDB = async () => {
  try {
    // Connect
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Task.deleteMany(),
      Habit.deleteMany(),
      Project.deleteMany(),
      LearningItem.deleteMany(),
      Opportunity.deleteMany()
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed Tasks
    const tasks = await Task.insertMany([
      {
        title: 'Build Dashboard MVP',
        description: 'Complete the core widgets and connect to API',
        priority: 'high',
        completed: false
      },
      {
        title: 'Review Next.js patterns',
        description: 'Study server components and data fetching',
        priority: 'medium',
        completed: true
      },
      {
        title: 'Integrate GitHub API',
        description: 'Fetch real commit stats and display in dashboard',
        priority: 'high',
        completed: false
      }
    ]);
    console.log(`✅ Created ${tasks.length} tasks`);

    // Seed Habits
    const habits = await Habit.insertMany([
      {
        name: 'Code Commits',
        category: 'coding',
        currentStreak: 5,
        bestStreak: 12,
        lastCompleted: new Date()
      },
      {
        name: 'Running',
        category: 'health',
        currentStreak: 3,
        bestStreak: 8,
        lastCompleted: new Date()
      },
      {
        name: 'Learn Something New',
        category: 'learning',
        currentStreak: 7,
        bestStreak: 15,
        lastCompleted: new Date()
      },
      {
        name: 'Ship Something',
        category: 'productivity',
        currentStreak: 1,
        bestStreak: 3,
        lastCompleted: null
      }
    ]);
    console.log(`✅ Created ${habits.length} habits`);

    // Seed Projects
    const projects = await Project.insertMany([
      {
        name: 'Dev Ops Dashboard',
        description: 'Personal ops center for CEO/Dev growth',
        stage: 'mvp',
        progress: 65,
        repo: 'github.com/cyfrinn/dev-ops-dashboard'
      },
      {
        name: 'AI News Aggregator',
        description: 'Scrape and summarize AI/tech news automatically',
        stage: 'idea',
        progress: 20
      },
      {
        name: 'Code Snippet Manager',
        description: 'Quick-access library of reusable code',
        stage: 'shipped',
        progress: 100,
        repo: 'github.com/cyfrinn/snippet-manager'
      }
    ]);
    console.log(`✅ Created ${projects.length} projects`);

    // Seed Learning Items
    const learning = await LearningItem.insertMany([
      {
        title: 'Next.js Server Components Deep Dive',
        source: 'Vercel Docs',
        topic: 'Next.js',
        status: 'in-progress',
        difficulty: 'intermediate'
      },
      {
        title: 'React Performance Optimization',
        source: 'Dev.to',
        topic: 'React',
        status: 'pending',
        difficulty: 'advanced'
      },
      {
        title: 'SaaS Pricing Models',
        source: 'Indie Hackers',
        topic: 'Business',
        status: 'pending',
        difficulty: 'beginner'
      }
    ]);
    console.log(`✅ Created ${learning.length} learning items`);

    // Seed Opportunities
    const opportunities = await Opportunity.insertMany([
      {
        title: 'AI automation tools seeing 40% growth in 2026',
        source: 'TechCrunch',
        category: 'trend',
        relevance: 95,
        date: 'Today',
        url: 'https://techcrunch.com/example'
      },
      {
        title: 'Senior Full-stack Dev at Series B startup',
        source: 'Hacker News',
        category: 'job',
        relevance: 75,
        date: 'Yesterday',
        url: 'https://news.ycombinator.com/item?id=12345'
      },
      {
        title: 'New SaaS category: Developer Experience Tools',
        source: 'Indie Hackers',
        category: 'saas',
        relevance: 88,
        date: '2 days ago',
        url: 'https://indiehackers.com/example'
      }
    ]);
    console.log(`✅ Created ${opportunities.length} opportunities`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
