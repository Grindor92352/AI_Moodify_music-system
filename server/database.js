const { Pool } = require('pg');

// Create a new PostgreSQL connection pool
// Supports standard connection string (e.g. Neon DB, local Docker PG) or individual parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  const isExternalDb = dbUrl.includes('neon.tech') || dbUrl.includes('supabase') || dbUrl.includes('amazonaws');

  poolConfig = {
    connectionString: dbUrl,
    connectionTimeoutMillis: 10000,
  };

  // Only enable SSL for external hosted databases, not for local Docker PostgreSQL
  if (isExternalDb) {
    let dbHost = 'localhost';
    try {
      dbHost = new URL(dbUrl).hostname;
    } catch (e) {
      console.warn('Could not parse DATABASE_URL for hostname:', e.message);
    }
    poolConfig.ssl = {
      rejectUnauthorized: false,
      servername: dbHost,
    };
  }
} else {
  poolConfig = {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'moodify',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT || 5432,
  };
}

const pool = new Pool(poolConfig);

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
