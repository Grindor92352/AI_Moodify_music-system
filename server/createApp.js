const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const musicRoutes = require('./routes/musicRoutes');
const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

/**
 * Builds the Express app without starting the HTTP listener (for tests and clustering workers).
 */
function createApp() {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use('/api/music', musicRoutes);
  app.use('/api', authRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/playlists', playlistRoutes);

  app.get('/', (req, res) => {
    res.send('Orchestration Server is robust and routing securely.');
  });

  return app;
}

module.exports = { createApp };
