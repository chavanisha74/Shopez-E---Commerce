const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const { all } = req.query;
    const query = {};

    if (!all || (req.user && req.user.userType !== 'admin')) {
      query.isActive = true;
    }

    const categories = await Category.find(query).sort({ name: 1 });

    // Include product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          category: cat._id,
          isActive: true
        });
        return {
          ...cat.toObject(),
          productCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get category by slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        productCount
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name'
      });
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: finalSlug }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name or slug already exists'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: finalSlug,
      description: description || '',
      image: image || undefined,
      isActive: isActive !== undefined ? !!isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a category
 * @route   PATCH /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updates = { ...req.body };
    if (updates.name && !updates.slug) {
      updates.slug = updates.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a category safely
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Safety rule: Do not delete if products are assigned
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}". It still has ${productCount} associated product(s). Please reassign or delete them first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
