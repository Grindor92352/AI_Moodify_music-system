const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  playlistCreate,
  playlistUpdate,
  playlistIdParam,
  playlistSongParams,
  addSongToPlaylist
} = require('../validators');

router.use(requireAuth);

router.get('/', playlistController.getUserPlaylists);
router.post('/create', playlistCreate, playlistController.createPlaylist);
router.post('/:playlistId/add-song', playlistIdParam, addSongToPlaylist, playlistController.addSongToPlaylist);
router.delete('/:playlistId/remove-song/:songId', playlistSongParams, playlistController.removeSongFromPlaylist);
router.delete('/:playlistId', playlistIdParam, playlistController.deletePlaylist);
router.put('/:playlistId', playlistIdParam, playlistUpdate, playlistController.updatePlaylist);

module.exports = router;
