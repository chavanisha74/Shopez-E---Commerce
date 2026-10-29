const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  getAllUsers,
  toggleUserStatus
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All admin routes strictly require both authentication and admin authorization
router.use(protect, requireAdmin);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Order management
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/tracking', updateOrderTracking);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
