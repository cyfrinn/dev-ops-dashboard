require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const tasksRouter = require('./routes/tasks');
const habitsRouter = require('./routes/habits');
const projectsRouter = require('./routes/projects');
const learningRouter = require('./routes/learning');
const opportunitiesRouter = require('./routes/opportunities');
const statsRouter = require('./routes/stats');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3001;

// Global error handlers
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB().catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err);
  process.exit(1);
});

// API Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/learning', learningRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Route error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Dashboard backend running on port ${PORT}`);
  console.log(`📊 MongoDB Atlas connected`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
