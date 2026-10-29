const Product = require('../models/Product');
const Category = require('../models/Category');
const { calculateFinalPrice } = require('../utils/priceCalculator');

/**
 * @desc    Get all products with search, filter, sort & pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minDiscount,
      size,
      gender,
      sort,
      page = 1,
      limit = 12,
      all // if admin wants all including inactive
    } = req.query;

    const query = {};

    // By default, only active products unless requested by admin
    if (!all || (req.user && req.user.userType !== 'admin')) {
      query.isActive = true;
    }

    // Text search in title and description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Category filter by ID or slug
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.category = cat._id;
        } else {
          // If slug not found, return empty results
          return res.status(200).json({
            success: true,
            count: 0,
            totalPages: 0,
            currentPage: Number(page),
            data: []
          });
        }
      }
    }

    // Price filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.finalPrice = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.finalPrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.finalPrice.$lte = Number(maxPrice);
      }
    }

    // Discount filtering
    if (minDiscount !== undefined && minDiscount !== '') {
      query.discount = { $gte: Number(minDiscount) };
    }

    // Size filter
    if (size && size !== 'all') {
      query.sizes = size;
    }

    // Gender filter
    if (gender && gender !== 'all') {
      query.gender = { $in: [gender, 'All', 'Unisex'] };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') {
      sortOptions = { finalPrice: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { finalPrice: -1 };
    } else if (sort === 'popular') {
      sortOptions = { numReviews: -1, rating: -1 };
    } else if (sort === 'discount') {
      sortOptions = { discount: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name slug'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products from the same category
    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
      .limit(4)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: product,
      related
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      mainImg,
      images,
      carousel,
      category,
      sizes,
      gender,
      price,
      discount,
      stock,
      isFeatured,
      isActive
    } = req.body;

    if (!title || !description || !mainImg || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, mainImg, category, and price.'
      });
    }

    // Validate category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not exist.'
      });
    }

    const calculatedFinal = calculateFinalPrice(price, discount || 0);

    const product = await Product.create({
      title,
      description,
      mainImg,
      images: images || [],
      carousel: carousel || [],
      category,
      sizes: sizes && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      gender: gender || 'All',
      price: Number(price),
      discount: Number(discount) || 0,
      finalPrice: calculatedFinal,
      stock: Number(stock) !== undefined ? Number(stock) : 10,
      isFeatured: !!isFeatured,
      isActive: isActive !== undefined ? !!isActive : true
    });

    const populated = await Product.findById(product._id).populate(
      'category',
      'name slug'
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an existing product
 * @route   PATCH /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updates = { ...req.body };

    if (updates.price !== undefined || updates.discount !== undefined) {
      const p = updates.price !== undefined ? updates.price : product.price;
      const d = updates.discount !== undefined ? updates.discount : product.discount;
      updates.finalPrice = calculateFinalPrice(p, d);
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
