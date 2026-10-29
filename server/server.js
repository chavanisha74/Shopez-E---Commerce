const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`  SHOPEZ E-Commerce Backend Server       `);
      console.log(`  Running on: http://localhost:${PORT}   `);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=========================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection Error:', err);
      // server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('Failed to initialize server:', err.message);
    process.exit(1);
  }
};

startServer();
