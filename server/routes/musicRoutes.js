const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

// Full pipeline: image → AI mood detection → song lookup
router.post('/analyze', musicController.generatePlaylist);

// Refresh only: skip AI, re-run song lookup for an already-known mood
router.post('/refresh', musicController.refreshPlaylist);

module.exports = router;
