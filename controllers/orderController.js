const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product', 'name price category status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { customerName, mobileNumber, productId, product, quantity, orderStatus } = req.body;

    const targetProductId = productId || (typeof product === 'string' ? product : product?._id);

    if (!customerName || !mobileNumber || !targetProductId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name, mobile number, and select a product',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetProductId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format provided',
      });
    }

    const foundProduct = await Product.findById(targetProductId);
    if (!foundProduct) {
      return res.status(404).json({ success: false, message: 'Selected product not found in database' });
    }

    const numQty = Number(quantity) || 1;
    if (numQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Order quantity must be at least 1',
      });
    }

    // Auto-calculate Total Price
    const totalPrice = foundProduct.price * numQty;

    const order = await Order.create({
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      product: targetProductId,
      quantity: numQty,
      totalPrice,
      orderStatus: orderStatus || 'Pending',
    });

    const populatedOrder = await Order.findById(order._id).populate('product', 'name price category status');

    console.log(`✅ Order saved to MongoDB DB [ID: ${order._id}] — Customer: ${order.customerName}`);

    res.status(201).json({
      success: true,
      message: 'Order saved to database successfully',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('❌ Failed to save order to DB:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, customerName, mobileNumber, quantity } = req.body;

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found in database' });
    }

    if (orderStatus) {
      const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`,
        });
      }
      order.orderStatus = orderStatus;
    }

    if (customerName) order.customerName = customerName.trim();
    if (mobileNumber) order.mobileNumber = mobileNumber.trim();

    if (quantity !== undefined) {
      const foundProduct = await Product.findById(order.product);
      if (foundProduct) {
        order.quantity = Number(quantity);
        order.totalPrice = foundProduct.price * Number(quantity);
      }
    }

    await order.save();
    const updatedOrder = await Order.findById(order._id).populate('product', 'name price category status');

    console.log(`✅ Order updated in MongoDB DB [ID: ${order._id}] — Status: ${order.orderStatus}`);

    res.json({
      success: true,
      message: 'Order updated in database successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('❌ Failed to update order in DB:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found in database' });
    }

    await order.deleteOne();
    console.log(`🗑️ Order deleted from MongoDB DB [ID: ${req.params.id}]`);

    res.json({
      success: true,
      message: 'Order deleted from database successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('❌ Failed to delete order from DB:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};
