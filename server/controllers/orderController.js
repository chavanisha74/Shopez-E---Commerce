const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateFinalPrice, calculateOrderTotals } = require('../utils/priceCalculator');
const { generateOrderNumber } = require('../utils/orderNumberGenerator');

/**
 * @desc    Create a new order from cart
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required shipping address fields.'
      });
    }

    // Retrieve user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before placing an order.'
      });
    }

    // Validate stock and verify current pricing for all items
    const orderItems = [];
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${cartItem.titleSnapshot}" is no longer available.`
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Only ${product.stock} left in stock.`
        });
      }

      const finalPrice = calculateFinalPrice(product.price, product.discount);
      const lineTotal = Math.round(finalPrice * cartItem.quantity * 100) / 100;

      orderItems.push({
        productId: product._id,
        title: product.title,
        image: product.mainImg,
        price: product.price,
        discount: product.discount,
        finalPrice,
        size: cartItem.size || 'Standard',
        quantity: cartItem.quantity,
        lineTotal
      });
    }

    // Calculate totals on backend
    const totals = calculateOrderTotals(orderItems);

    // Determine initial payment status
    let paymentStatus = 'Pending';
    let initialOrderStatus = 'Pending';

    if (paymentMethod === 'Cash on Delivery') {
      paymentStatus = 'Pending';
      initialOrderStatus = 'Confirmed';
    } else {
      // In online test mode or gateway
      paymentStatus = 'Paid';
      initialOrderStatus = 'Processing';
    }

    // Decrement stock for all items
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      paymentMethod,
      paymentStatus,
      paymentDetails: {
        transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        gateway: paymentMethod === 'Online Payment' ? 'Test Gateway / Card' : 'COD'
      },
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      shippingFee: totals.shippingFee,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      status: initialOrderStatus,
      orderDate: new Date()
    });

    // Clear user's cart after successful order creation
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments({ userId: req.user._id });
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Security check: Customer can only view their own orders
    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.userType !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Cancel an order & restore stock
 * @route   POST /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Security check
    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.userType !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Eligibility check
    const cancellableStatuses = ['Pending', 'Confirmed', 'Processing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status}.`
      });
    }

    // Restore stock for all items
    for (const item of order.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.status = 'Cancelled';
    order.cancelReason = reason || 'Cancelled by customer';
    if (order.paymentStatus === 'Paid') {
      order.paymentStatus = 'Refunded';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Request return for delivered order
 * @route   POST /api/orders/:id/return
 * @access  Private
 */
const returnOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.userType !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to return this order'
      });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Only delivered orders can be requested for return.'
      });
    }

    order.status = 'Returned';
    order.cancelReason = reason || 'Return requested by customer';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Return request processed successfully',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  returnOrder
};
