const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CodeMitra API is running cleanly' });
});

// Admin & Demo Data Auto-Seeder
const seedInitialData = async () => {
  try {
    // 1. Seed Admin User
    const adminExists = await User.findOne({ email: 'admin@codemitra.com' });
    if (!adminExists) {
      await User.create({
        name: 'CodeMitra Admin',
        email: 'admin@codemitra.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('✅ Admin user seeded automatically: admin@codemitra.com / admin123');
    }

    // 2. Seed Sample Products if DB empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = await Product.insertMany([
        { name: 'Wireless Ergonomic Mouse', category: 'Electronics', price: 1299, quantity: 45, status: 'Active' },
        { name: 'Mechanical RGB Keyboard', category: 'Electronics', price: 3499, quantity: 20, status: 'Active' },
        { name: 'Noise-Cancelling Headphones', category: 'Audio', price: 4999, quantity: 15, status: 'Active' },
        { name: '27-inch 4K Monitor', category: 'Peripherals', price: 24999, quantity: 8, status: 'Active' },
        { name: 'USB-C Multiport Dock', category: 'Accessories', price: 2199, quantity: 0, status: 'Inactive' },
      ]);
      console.log('✅ Sample products seeded');

      // 3. Seed Sample Orders
      const orderCount = await Order.countDocuments();
      if (orderCount === 0 && sampleProducts.length >= 3) {
        await Order.insertMany([
          {
            customerName: 'Rahul Sharma',
            mobileNumber: '9876543210',
            product: sampleProducts[0]._id,
            quantity: 2,
            totalPrice: sampleProducts[0].price * 2,
            orderStatus: 'Delivered',
          },
          {
            customerName: 'Priya Patel',
            mobileNumber: '9812345678',
            product: sampleProducts[1]._id,
            quantity: 1,
            totalPrice: sampleProducts[1].price * 1,
            orderStatus: 'Processing',
          },
          {
            customerName: 'Amit Verma',
            mobileNumber: '9765432109',
            product: sampleProducts[2]._id,
            quantity: 1,
            totalPrice: sampleProducts[2].price * 1,
            orderStatus: 'Pending',
          },
        ]);
        console.log('✅ Sample orders seeded');
      }
    }
  } catch (error) {
    console.error('Data seeding error:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  await connectDB();
  await seedInitialData();
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port http://localhost:${PORT}`);
  });
};

startServer();
