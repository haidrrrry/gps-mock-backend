const mongoose = require('mongoose');

let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const options = {
      family: 4, // Force IPv4
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
    };
    cached.promise = mongoose.connect(process.env.MONGODB_URI, options);
  }
  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn;
}

module.exports = connectDB;
