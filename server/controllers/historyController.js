const { getDb } = require('../database');

// POST /api/history/save
exports.saveHistory = async (req, res) => {
  const email = req.user.email;

  const { mood, songs, videoIds } = req.body;
  if (!mood) return res.status(400).json({ error: 'Mood is required' });

  try {
    const db = await getDb();
    await db.query(
      'INSERT INTO mood_history (user_email, mood, songs, video_ids) VALUES ($1, $2, $3, $4)',
      [email, mood, songs ? JSON.stringify(songs) : null, videoIds ? JSON.stringify(videoIds) : null]
    );
    res.status(201).json({ message: 'History saved' });
  } catch (err) {
    console.error('Save history error:', err);
    res.status(500).json({ error: 'Failed to save history' });
  }
};

// GET /api/history
exports.getHistory = async (req, res) => {
  const email = req.user.email;

  try {
    const db = await getDb();
    const result = await db.query(
      'SELECT id, mood, songs, video_ids, detected_at FROM mood_history WHERE user_email = $1 ORDER BY detected_at DESC LIMIT 50',
      [email]
    );

    const history = result.rows.map(row => ({
      id: row.id,
      mood: row.mood,
      songs: row.songs ? JSON.parse(row.songs) : [],
      videoIds: row.video_ids ? JSON.parse(row.video_ids) : [],
      date: new Date(row.detected_at).toLocaleString(),
      tracks: row.songs ? JSON.parse(row.songs).length : 0
    }));

    res.status(200).json({ history });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
