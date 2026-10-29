const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateFinalPrice, calculateOrderTotals } = require('../utils/priceCalculator');

// Helper to sanitize & synchronize cart with current DB product info
const populateAndSyncCart = async (cart) => {
  let modified = false;
  const validItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    // If product was deleted or deactivated
    if (!product || !product.isActive) {
      modified = true;
      continue;
    }

    // Refresh snapshots with server-trusted data
    const computedFinal = calculateFinalPrice(product.price, product.discount);
    if (
      item.priceSnapshot !== product.price ||
      item.discountSnapshot !== product.discount ||
      item.finalPriceSnapshot !== computedFinal ||
      item.titleSnapshot !== product.title ||
      item.imageSnapshot !== product.mainImg
    ) {
      item.titleSnapshot = product.title;
      item.imageSnapshot = product.mainImg;
      item.priceSnapshot = product.price;
      item.discountSnapshot = product.discount;
      item.finalPriceSnapshot = computedFinal;
      modified = true;
    }

    // Ensure requested quantity does not exceed available stock
    if (product.stock > 0 && item.quantity > product.stock) {
      item.quantity = product.stock;
      modified = true;
    }

    validItems.push(item);
  }

  if (modified || validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  // Calculate order totals summary
  const totals = calculateOrderTotals(cart.items);

  return {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items,
    totals,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    updatedAt: cart.updatedAt
  };
};

/**
 * @desc    Get user's shopping cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const synchronizedCart = await populateAndSyncCart(cart);

    res.status(200).json({
      success: true,
      data: synchronizedCart
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add item to cart or merge guest cart
 * @route   POST /api/cart/items
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, size, quantity = 1, guestItems } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    // Handle guest cart merge request
    if (Array.isArray(guestItems) && guestItems.length > 0) {
      for (const gItem of guestItems) {
        if (!gItem.productId) continue;
        const product = await Product.findById(gItem.productId);
        if (!product || !product.isActive || product.stock <= 0) continue;

        const gSize = gItem.size || (product.sizes && product.sizes[0]) || 'Standard';
        const existingIdx = cart.items.findIndex(
          (item) => item.productId.toString() === product._id.toString() && item.size === gSize
        );

        const computedFinal = calculateFinalPrice(product.price, product.discount);

        if (existingIdx > -1) {
          const newQty = cart.items[existingIdx].quantity + (gItem.quantity || 1);
          cart.items[existingIdx].quantity = Math.min(newQty, product.stock);
        } else {
          cart.items.push({
            productId: product._id,
            titleSnapshot: product.title,
            imageSnapshot: product.mainImg,
            priceSnapshot: product.price,
            discountSnapshot: product.discount,
            finalPriceSnapshot: computedFinal,
            size: gSize,
            quantity: Math.min(gItem.quantity || 1, product.stock)
          });
        }
      }

      await cart.save();
      const synchronizedCart = await populateAndSyncCart(cart);
      return res.status(200).json({
        success: true,
        message: 'Guest cart merged successfully',
        data: synchronizedCart
      });
    }

    // Single item add
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or is currently unavailable'
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently out of stock'
      });
    }

    // Determine size
    let selectedSize = size;
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize || !product.sizes.includes(selectedSize)) {
        selectedSize = product.sizes[0];
      }
    } else {
      selectedSize = 'Standard';
    }

    const itemQty = Math.max(1, parseInt(quantity, 10) || 1);
    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === product._id.toString() && item.size === selectedSize
    );

    const computedFinal = calculateFinalPrice(product.price, product.discount);

    if (existingIndex > -1) {
      const targetQty = cart.items[existingIndex].quantity + itemQty;
      if (targetQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than ${product.stock} units available in stock.`
        });
      }
      cart.items[existingIndex].quantity = targetQty;
      cart.items[existingIndex].priceSnapshot = product.price;
      cart.items[existingIndex].discountSnapshot = product.discount;
      cart.items[existingIndex].finalPriceSnapshot = computedFinal;
    } else {
      if (itemQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock.`
        });
      }
      cart.items.push({
        productId: product._id,
        titleSnapshot: product.title,
        imageSnapshot: product.mainImg,
        priceSnapshot: product.price,
        discountSnapshot: product.discount,
        finalPriceSnapshot: computedFinal,
        size: selectedSize,
        quantity: itemQty
      });
    }

    await cart.save();
    const synchronizedCart = await populateAndSyncCart(cart);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: synchronizedCart
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update item quantity or size in cart
 * @route   PATCH /api/cart/items/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity, size } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    const item = cart.items[itemIndex];
    const product = await Product.findById(item.productId);

    if (!product || !product.isActive) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available and was removed from your cart'
      });
    }

    if (quantity !== undefined) {
      const newQty = parseInt(quantity, 10);
      if (newQty <= 0) {
        // Remove item if quantity is zero or less
        cart.items.splice(itemIndex, 1);
      } else {
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available in stock`
          });
        }
        item.quantity = newQty;
      }
    }

    if (size) {
      if (product.sizes && product.sizes.length > 0 && !product.sizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: `Invalid size selected. Available: ${product.sizes.join(', ')}`
        });
      }
      item.size = size;
    }

    await cart.save();
    const synchronizedCart = await populateAndSyncCart(cart);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: synchronizedCart
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    const synchronizedCart = await populateAndSyncCart(cart);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: synchronizedCart
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        userId: req.user._id,
        items: [],
        totals: {
          subtotal: 0,
          discountAmount: 0,
          itemsTotal: 0,
          shippingFee: 0,
          taxAmount: 0,
          totalAmount: 0
        },
        itemCount: 0
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
