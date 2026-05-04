const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

router.post('/update', auth, progressController.updateProgress);
router.get('/:userId', auth, progressController.getProgress);
router.get('/', auth, progressController.getProgress);

module.exports = router;
