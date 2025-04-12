import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = globalThis._mongo || {};

/**
 * The dbConnect function ensures that MongoDB is only connected once,
 * reusing the connection if it's already established.
 */
const dbConnect = async () => {
  // If there is an existing connection, reuse it
  if (cached.isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    // Establish a new connection if none exists
    console.log('Connecting to MongoDB...');
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Cache the connection once it is established
    cached.isConnected = db.connection.readyState === 1;

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Could not connect to MongoDB');
  }
};

export default dbConnect;