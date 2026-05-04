const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload-resume', auth, upload.single('resume'), profileController.uploadResume);
router.post('/linkedin', auth, profileController.analyzeLinkedIn);
router.post('/manual', auth, profileController.manualUpdate);
router.get('/', auth, profileController.getProfile);

module.exports = router;
