const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getWeddingAdvice, generatePackageDescription } = require('../controllers/aiController');

router.post('/advice', protect, getWeddingAdvice);
router.post('/package-description', protect, generatePackageDescription);
router.post('/timeline', protect, require('../controllers/aiController').generateTimeline);
router.post('/chat', protect, require('../controllers/aiController').chatWithAI);
router.get('/history/:weddingId', protect, require('../controllers/aiController').getChatHistory);
router.post('/ask', protect, require('../controllers/aiController').askAI);

// Budget Planner Routes
router.post('/suggest-budget', protect, require('../controllers/aiController').generateBudgetBreakdown);
router.post('/apply-budget', protect, require('../controllers/aiController').applyBudgetBreakdown);

module.exports = router;
