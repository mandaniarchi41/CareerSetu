const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

router.get('/stats', adminAuth, adminController.getDashboardStats);
router.get('/users', adminAuth, adminController.getAllUsers);
router.get('/paths', adminAuth, adminController.getAllLearningPaths);
router.delete('/users/:id', adminAuth, adminController.deleteUser);
router.put('/users/:id/role', adminAuth, adminController.updateUserRole);
router.delete('/paths/:id', adminAuth, adminController.deleteLearningPath);

module.exports = router;
