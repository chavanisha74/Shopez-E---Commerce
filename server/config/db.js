const mongoose = require('mongoose');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopez';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[Database] MongoDB Connected to live instance: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${uri}.`);
    console.log('[Database] Attempting fallback to in-memory MongoDB for development/testing...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB successfully: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[Database] Failed to initialize in-memory MongoDB fallback:', memErr.message);
      console.error('[Database] Please ensure MongoDB is running or MONGODB_URI is correctly set in .env');
      throw err;
    }
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
