const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { requireAuth } = require('../middleware/authMiddleware');
const { historySave } = require('../validators');

router.post('/save', requireAuth, historySave, historyController.saveHistory);
router.get('/', requireAuth, historyController.getHistory);

module.exports = router;
