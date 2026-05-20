const { pool } = require('../database');

exports.getUserPlaylists = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const playlistsResult = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.created_at,
        COUNT(ps.id) as song_count
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      WHERE p.user_email = $1
      GROUP BY p.id, p.name, p.description, p.created_at
      ORDER BY p.created_at DESC
    `, [userEmail]);

    const playlists = [];
    for (const playlist of playlistsResult.rows) {
      const songsResult = await pool.query(`
        SELECT video_id, title, artist, added_at
        FROM playlist_songs
        WHERE playlist_id = $1
        ORDER BY added_at ASC
      `, [playlist.id]);

      playlists.push({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        createdAt: playlist.created_at,
        songCount: parseInt(playlist.song_count, 10),
        songs: songsResult.rows.map(song => ({
          videoId: song.video_id,
          title: song.title,
          artist: song.artist,
          addedAt: song.added_at
        }))
      });
    }

    res.json({ playlists });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description = '' } = req.validated;
    const userEmail = req.user.email;

    const result = await pool.query(`
      INSERT INTO playlists (user_email, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, created_at
    `, [userEmail, name, description || '']);

    const playlist = result.rows[0];
    res.json({
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        createdAt: playlist.created_at,
        songCount: 0,
        songs: []
      }
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, videoId, title, artist } = req.validated;
    const userEmail = req.user.email;

    if (!playlistId || !videoId || !title || !artist) {
      return res.status(400).json({ error: 'videoId, title, and artist are required' });
    }

    const playlistCheck = await pool.query(`
      SELECT id FROM playlists WHERE id = $1 AND user_email = $2
    `, [playlistId, userEmail]);

    if (playlistCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const existingCheck = await pool.query(`
      SELECT id FROM playlist_songs WHERE playlist_id = $1 AND video_id = $2
    `, [playlistId, videoId]);

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Song already exists in playlist' });
    }

    await pool.query(`
      INSERT INTO playlist_songs (playlist_id, video_id, title, artist)
      VALUES ($1, $2, $3, $4)
    `, [playlistId, videoId, title, artist]);

    res.json({ message: 'Song added to playlist successfully' });
  } catch (error) {
    console.error('Add song to playlist error:', error);
    res.status(500).json({ error: 'Failed to add song to playlist' });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.validated;
    const userEmail = req.user.email;

    const playlistCheck = await pool.query(`
      SELECT id FROM playlists WHERE id = $1 AND user_email = $2
    `, [playlistId, userEmail]);

    if (playlistCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const result = await pool.query(`
      DELETE FROM playlist_songs 
      WHERE playlist_id = $1 AND id = $2
    `, [playlistId, songId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Song not found in playlist' });
    }

    res.json({ message: 'Song removed from playlist successfully' });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.validated;
    const userEmail = req.user.email;

    const result = await pool.query(`
      DELETE FROM playlists WHERE id = $1 AND user_email = $2
    `, [playlistId, userEmail]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const { playlistId, name, description = '' } = req.validated;
    const userEmail = req.user.email;

    const result = await pool.query(`
      UPDATE playlists 
      SET name = $1, description = $2
      WHERE id = $3 AND user_email = $4
      RETURNING id, name, description, created_at
    `, [name, description || '', playlistId, userEmail]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const playlist = result.rows[0];
    res.json({
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        createdAt: playlist.created_at
      }
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
};
