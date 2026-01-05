const express = require('express');
const router = express.Router();
const { addVendor, getVendors, updateVendor, deleteVendor, addPayment } = require('../controllers/vendorController');
const { protect: auth } = require('../middleware/authMiddleware');

router.route('/').post(auth, addVendor).get(auth, getVendors);
router.route('/:id').put(auth, updateVendor).delete(auth, deleteVendor);
router.route('/:id/payment').post(auth, addPayment);

module.exports = router;
