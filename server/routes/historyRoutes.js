const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.post('/save', historyController.saveHistory);
router.get('/', historyController.getHistory);

module.exports = router;
