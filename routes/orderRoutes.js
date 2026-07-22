const express = require('express');
const router = express.Router();
const {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .put(updateOrderStatus)
  .delete(deleteOrder);

module.exports = router;
