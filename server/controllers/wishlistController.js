const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate({
      path: 'products',
      populate: { path: 'category', select: 'name slug' }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      count: wishlist.products.length,
      data: wishlist.products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add or toggle product in wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(
      (id) => id.toString() === productId.toString()
    );

    let isAdded = false;
    if (index > -1) {
      wishlist.products.splice(index, 1);
      isAdded = false;
    } else {
      wishlist.products.push(productId);
      isAdded = true;
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      isWishlisted: isAdded,
      message: isAdded
        ? 'Added to your wishlist'
        : 'Removed from your wishlist'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId.toString()
      );
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist
};
