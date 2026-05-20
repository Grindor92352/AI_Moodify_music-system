const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/save', requireAuth, historyController.saveHistory);
router.get('/', requireAuth, historyController.getHistory);

module.exports = router;
