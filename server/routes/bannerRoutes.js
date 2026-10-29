const express = require('express');
const router = express.Router();
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.get('/', getBanners);

// Admin-only endpoints
router.post('/', protect, requireAdmin, createBanner);
router.patch('/:id', protect, requireAdmin, updateBanner);
router.delete('/:id', protect, requireAdmin, deleteBanner);

module.exports = router;
