const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Please add customer name'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Please add mobile number'],
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please select a product'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify order quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
