const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getWeddingAdvice, generatePackageDescription } = require('../controllers/aiController');

router.post('/advice', protect, getWeddingAdvice);
router.post('/package-description', protect, generatePackageDescription);
router.post('/chat', protect, require('../controllers/aiController').chatWithAI);
router.get('/history/:weddingId', protect, require('../controllers/aiController').getChatHistory);

module.exports = router;
