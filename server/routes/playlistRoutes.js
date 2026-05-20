const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { requireAuth } = require('../middleware/authMiddleware');

// All playlist routes require authentication
router.use(requireAuth);

// Get user's playlists
router.get('/', playlistController.getUserPlaylists);

// Create new playlist
router.post('/create', playlistController.createPlaylist);

// Add song to playlist
router.post('/:playlistId/add-song', playlistController.addSongToPlaylist);

// Remove song from playlist
router.delete('/:playlistId/remove-song/:songId', playlistController.removeSongFromPlaylist);

// Delete playlist
router.delete('/:playlistId', playlistController.deletePlaylist);

// Update playlist (name, description)
router.put('/:playlistId', playlistController.updatePlaylist);

module.exports = router;