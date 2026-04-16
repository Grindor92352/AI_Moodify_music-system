const express = require('express');
const cors = require('cors');
require('dotenv').config();

const musicRoutes = require('./routes/musicRoutes');

const app = express();
const port = 5000;

// Explicitly restricted to port 3000 to accept React requests securely
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Scale limit to securely buffer base64 string payloads centrally
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Core API endpoints
app.use('/api/music', musicRoutes);

app.get('/', (req, res) => {
  res.send('Orchestration Server is robust and routing securely.');
});

app.listen(port, () => {
  console.log(`Server listening securely on port ${port}`);
});
