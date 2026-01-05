const express = require('express');
const router = express.Router();
const { createPackage, getPackages } = require('../controllers/packageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPackages) // Users need to be logged in to see? Or public? Let's keep protect for now.
    .post(protect, admin, createPackage);

module.exports = router;
