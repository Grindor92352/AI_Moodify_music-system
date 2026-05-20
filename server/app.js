const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const musicRoutes = require('./routes/musicRoutes');
const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

const port = 5000;
const useClustering = process.env.USE_CLUSTER === 'true';

// Setup clustering for handling 100+ concurrent users efficiently (optional in Dev)
if (useClustering && cluster.isMaster) {
  // Master process
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);
  console.log(`Forking server across ${numCPUs} CPU cores to handle high concurrency...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork(); // Replace the dead worker
  });

} else {
  // Worker processes or Single Process Mode
  const app = express();

  // Explicitly restricted to port 3000, 3001, and 5173 to accept React requests securely
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // Cookie Parser is required to parse HttpOnly cookies from the frontend
  app.use(cookieParser());

  // Scale limit to securely buffer base64 string payloads centrally
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Core API endpoints
  app.use('/api/music', musicRoutes);
  app.use('/api', authRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/playlists', playlistRoutes);

  app.get('/', (req, res) => {
    const modeInfo = useClustering ? `Worker ${process.pid}` : 'Single Process';
    res.send(`Orchestration Server is robust and routing securely on ${modeInfo}.`);
  });

  const serverMsg = useClustering
    ? `Worker ${process.pid} listening securely on port ${port} across all interfaces`
    : `Server listening securely on port ${port} (Single Process Mode)`;

  app.listen(port, '0.0.0.0', () => {
    console.log(serverMsg);
  });
}
