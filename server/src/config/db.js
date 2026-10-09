import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  mongoose.connection.on('disconnected', () =>
    console.warn('  MongoDB disconnected — will auto-reconnect')
  );
  mongoose.connection.on('error', (err) =>
    console.error('MongoDB error:', err.message)
  );

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(` MongoDB connected: ${mongoose.connection.host}`);
}
