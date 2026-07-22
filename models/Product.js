const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a product category'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
      min: [0, 'Price must be positive'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please add product quantity'],
      min: [0, 'Quantity must be non-negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
