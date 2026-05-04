const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const auth = require('../middleware/auth');

router.get('/', auth, plannerController.getTasks);
router.post('/update', auth, plannerController.updateTask);
router.post('/add', auth, plannerController.addTask);

module.exports = router;
