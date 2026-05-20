const { Pool } = require('pg');

let poolConfig;

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  const isExternalDb = dbUrl.includes('neon.tech') || dbUrl.includes('supabase') || dbUrl.includes('amazonaws');

  poolConfig = {
    connectionString: dbUrl,
    connectionTimeoutMillis: 10000,
  };

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

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

async function tableHasColumn(tableName, columnName) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    [tableName, columnName]
  );
  return result.rows.length > 0;
}

async function migrateHistoryJsonToTracks() {
  const hasSongsCol = await tableHasColumn('mood_history', 'songs');
  if (!hasSongsCol) return;

  const rows = await pool.query(
    'SELECT id, songs, video_ids FROM mood_history WHERE songs IS NOT NULL OR video_ids IS NOT NULL'
  );

  for (const row of rows.rows) {
    let songs = [];
    try {
      if (row.songs) songs = JSON.parse(row.songs);
    } catch {
      songs = [];
    }

    if (!Array.isArray(songs) || songs.length === 0) {
      try {
        const ids = row.video_ids ? JSON.parse(row.video_ids) : [];
        if (Array.isArray(ids)) {
          songs = ids.map((videoId, i) => ({
            videoId: String(videoId),
            title: 'Unknown Track',
            artist: 'Unknown Artist',
            position: i
          }));
        }
      } catch {
        songs = [];
      }
    }

    for (let i = 0; i < songs.length; i++) {
      const s = songs[i];
      if (!s?.videoId) continue;
      await pool.query(
        `INSERT INTO mood_history_tracks (history_id, video_id, title, artist, position)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (history_id, video_id) DO NOTHING`,
        [
          row.id,
          String(s.videoId).slice(0, 64),
          String(s.title || 'Unknown Track').slice(0, 500),
          String(s.artist || 'Unknown Artist').slice(0, 500),
          Number.isInteger(s.position) ? s.position : i
        ]
      );
    }
  }

  await pool.query('ALTER TABLE mood_history DROP COLUMN IF EXISTS songs');
  await pool.query('ALTER TABLE mood_history DROP COLUMN IF EXISTS video_ids');
  console.log('[DB] Migrated mood_history JSON columns to mood_history_tracks.');
}

async function migratePreferredSingersToTable() {
  const hasCol = await tableHasColumn('users', 'preferred_singers');
  if (!hasCol) return;

  const users = await pool.query(
    'SELECT email, preferred_singers FROM users WHERE preferred_singers IS NOT NULL'
  );

  for (const row of users.rows) {
    let singers = [];
    try {
      singers = JSON.parse(row.preferred_singers);
    } catch {
      singers = [];
    }
    if (!Array.isArray(singers)) continue;

    for (const name of singers) {
      if (typeof name !== 'string' || !name.trim()) continue;
      await pool.query(
        `INSERT INTO user_preferred_singers (user_email, singer_name)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [row.email, name.trim().slice(0, 255)]
      );
    }
  }

  await pool.query('ALTER TABLE users DROP COLUMN IF EXISTS preferred_singers');
  console.log('[DB] Migrated users.preferred_singers JSON to user_preferred_singers.');
}

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      age INTEGER
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      revoked_at TIMESTAMP
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user
    ON refresh_tokens (user_email) WHERE revoked_at IS NULL;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_preferred_singers (
      user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      singer_name VARCHAR(255) NOT NULL,
      PRIMARY KEY (user_email, singer_name)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mood_history (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      mood VARCHAR(100) NOT NULL,
      detected_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mood_history_tracks (
      id SERIAL PRIMARY KEY,
      history_id INTEGER NOT NULL REFERENCES mood_history(id) ON DELETE CASCADE,
      video_id VARCHAR(64) NOT NULL,
      title VARCHAR(500) NOT NULL,
      artist VARCHAR(500) NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      UNIQUE (history_id, video_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS playlists (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS playlist_songs (
      id SERIAL PRIMARY KEY,
      playlist_id INTEGER NOT NULL,
      video_id VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      artist VARCHAR(500) NOT NULL,
      added_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      UNIQUE(playlist_id, video_id)
    );
  `);

  await migrateHistoryJsonToTracks();
  await migratePreferredSingersToTable();
}

async function getDb() {
  try {
    await runMigrations();
    console.log('PostgreSQL Database connected and initialized.');
  } catch (err) {
    console.error(
      "Failed to connect to PostgreSQL. Please make sure the 'moodify' database exists and your credentials in .env are correct:",
      err.message
    );
  }
  return pool;
}

module.exports = { getDb, pool, runMigrations };
