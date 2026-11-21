const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/labour_connect';

async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;

