const Banner = require('../models/Banner');

/**
 * @desc    Get all active banners (or all if admin)
 * @route   GET /api/banners
 * @access  Public
 */
const getBanners = async (req, res, next) => {
  try {
    const { all } = req.query;
    const query = {};

    if (!all || (req.user && req.user.userType !== 'admin')) {
      query.isActive = true;
    }

    const banners = await Banner.find(query)
      .populate('categories', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a promotional banner
 * @route   POST /api/banners
 * @access  Private/Admin
 */
const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, banner, badge, link, categories, isActive } = req.body;

    if (!title || !banner) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and banner image'
      });
    }

    const newBanner = await Banner.create({
      title,
      subtitle: subtitle || '',
      banner,
      badge: badge || 'Special Offer',
      link: link || '/products',
      categories: categories || [],
      isActive: isActive !== undefined ? !!isActive : true
    });

    const populated = await Banner.findById(newBanner._id).populate(
      'categories',
      'name slug'
    );

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a banner
 * @route   PATCH /api/banners/:id
 * @access  Private/Admin
 */
const updateBanner = async (req, res, next) => {
  try {
    let bannerDoc = await Banner.findById(req.params.id);

    if (!bannerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    bannerDoc = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('categories', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: bannerDoc
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a banner
 * @route   DELETE /api/banners/:id
 * @access  Private/Admin
 */
const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
