const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'Active' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    const recentOrders = await Order.find()
      .populate('product', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders,
      },
      recentOrders,
      recentProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
