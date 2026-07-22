const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new product
// @route   POST /api/products
// @access  Private
const addProduct = async (req, res) => {
  try {
    const { name, productName, category, price, quantity, status } = req.body;

    const finalName = name || productName;
    if (!finalName || !finalName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid product name',
      });
    }

    const numPrice = Number(price);
    const numQty = Number(quantity);

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number',
      });
    }

    if (isNaN(numQty) || numQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid non-negative number',
      });
    }

    const product = await Product.create({
      name: finalName.trim(),
      category: (category || 'General').trim(),
      price: numPrice,
      quantity: numQty,
      status: status || 'Active',
    });

    console.log(`✅ Product saved to MongoDB DB [ID: ${product._id}] — Name: ${product.name}`);

    res.status(201).json({
      success: true,
      message: 'Product saved to database successfully',
      product,
    });
  } catch (error) {
    console.error('❌ Failed to save product to DB:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, status } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.name = name !== undefined ? name.trim() : product.name;
    product.category = category !== undefined ? category.trim() : product.category;
    product.price = price !== undefined ? Number(price) : product.price;
    product.quantity = quantity !== undefined ? Number(quantity) : product.quantity;
    product.status = status !== undefined ? status : product.status;

    const updatedProduct = await product.save();

    console.log(`✅ Product updated in MongoDB DB [ID: ${updatedProduct._id}]`);

    res.json({
      success: true,
      message: 'Product updated in database successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('❌ Failed to update product in DB:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in database' });
    }

    await product.deleteOne();
    console.log(`🗑️ Product deleted from MongoDB DB [ID: ${req.params.id}]`);

    res.json({
      success: true,
      message: 'Product deleted from database successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('❌ Failed to delete product from DB:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
