import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.error('CRITICAL: MONGODB_URI is not defined. Database operations will fail.');
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4 for stability in some environments
    };

    console.log("[DB] Initiating new connection to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("[DB] MongoDB Connected Successfully.");
      return mongoose;
    }).catch(err => {
      console.error("[DB] Connection Failed:", err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    console.error("[DB] Error resolving connection promise:", e.message);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
