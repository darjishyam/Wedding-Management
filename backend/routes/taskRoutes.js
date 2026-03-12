const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/', protect, getTasks);
router.post('/', protect, addTask);
router.patch('/:taskId', protect, updateTask);
router.delete('/:taskId', protect, deleteTask);

module.exports = router;
