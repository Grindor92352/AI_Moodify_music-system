const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { musicAnalyze, musicRefresh } = require('../validators');

router.post('/analyze', musicAnalyze, musicController.generatePlaylist);
router.post('/refresh', musicRefresh, musicController.refreshPlaylist);

module.exports = router;
