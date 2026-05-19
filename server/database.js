const { Pool } = require('pg');

// Create a new PostgreSQL connection pool
// This will automatically read from environment variables or use these fallbacks.
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'moodify',
  password: process.env.PGPASSWORD || 'postgres', // Common default on Windows
  port: process.env.PGPORT || 5432,
});

// Prevent fatal crashes if PostgreSQL loses connection or credentials are bad
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

async function getDb() {
  // Try to create the table if it doesn't exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        age INTEGER,
        preferred_singers TEXT
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mood_history (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        mood VARCHAR(100) NOT NULL,
        songs TEXT,
        video_ids TEXT,
        detected_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
      );
    `);
    console.log("PostgreSQL Database connected and initialized.");
  } catch (err) {
    console.error("Failed to connect to PostgreSQL. Please make sure the 'moodify' database exists and your credentials in .env are correct:", err.message);
  }

  // Return the pool so controllers can query it
  return pool;
}

module.exports = { getDb, pool };
