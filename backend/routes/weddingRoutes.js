const express = require('express');
const router = express.Router();
const { createWedding, getMyWedding, getAllWeddings, updateWedding, addCollaborator, removeCollaborator } = require('../controllers/weddingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createWedding);
router.get('/', protect, getAllWeddings);
router.get('/my', protect, getMyWedding);
router.put('/:id', protect, updateWedding);
router.post('/:id/collaborators', protect, addCollaborator);
router.delete('/:id/collaborators/:userId', protect, removeCollaborator);

module.exports = router;
