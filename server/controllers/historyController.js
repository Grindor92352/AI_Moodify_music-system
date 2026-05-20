const { pool } = require('../database');

async function insertHistoryTracks(historyId, songs) {
  if (!songs?.length) return;

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    await pool.query(
      `INSERT INTO mood_history_tracks (history_id, video_id, title, artist, position)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (history_id, video_id) DO NOTHING`,
      [historyId, song.videoId, song.title, song.artist, i]
    );
  }
}

exports.saveHistory = async (req, res) => {
  const email = req.user.email;
  const { mood, songs = [] } = req.validated;

  try {
    const insertResult = await pool.query(
      `INSERT INTO mood_history (user_email, mood) VALUES ($1, $2) RETURNING id`,
      [email, mood]
    );
    const historyId = insertResult.rows[0].id;
    await insertHistoryTracks(historyId, songs);

    res.status(201).json({ message: 'History saved', id: historyId });
  } catch (err) {
    console.error('Save history error:', err);
    res.status(500).json({ error: 'Failed to save history' });
  }
};

exports.getHistory = async (req, res) => {
  const email = req.user.email;

  try {
    const sessions = await pool.query(
      `SELECT id, mood, detected_at
       FROM mood_history
       WHERE user_email = $1
       ORDER BY detected_at DESC
       LIMIT 50`,
      [email]
    );

    const history = [];
    for (const row of sessions.rows) {
      const tracksResult = await pool.query(
        `SELECT video_id, title, artist, position
         FROM mood_history_tracks
         WHERE history_id = $1
         ORDER BY position ASC, id ASC`,
        [row.id]
      );

      const songs = tracksResult.rows.map(t => ({
        videoId: t.video_id,
        title: t.title,
        artist: t.artist
      }));

      history.push({
        id: row.id,
        mood: row.mood,
        songs,
        videoIds: songs.map(s => s.videoId),
        date: new Date(row.detected_at).toLocaleString(),
        tracks: songs.length
      });
    }

    res.status(200).json({ history });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
