const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Single image upload
router.post(
  '/single',
  protect,
  requireAdmin,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    // Return the relative URL path accessible by the browser
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  }
);

// Multiple image upload (e.g. for product galleries)
router.post(
  '/multiple',
  protect,
  requireAdmin,
  upload.array('images', 5),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
    res.status(200).json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      urls: fileUrls
    });
  }
);

module.exports = router;
