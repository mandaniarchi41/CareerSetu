const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage (for parsing PDF files inline)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-profile', auth, aiController.analyzeProfile);
router.post('/generate-path', auth, aiController.generatePath);
router.get('/learning-path', auth, aiController.getLearningPath);
router.get('/history', auth, aiController.getHistory);
router.delete('/learning-path/:id', auth, aiController.deleteLearningPath);
router.post('/chat', auth, aiController.chat);
router.post('/career-engine', auth, upload.single('resume'), aiController.recommendCareerEngine);

module.exports = router;
