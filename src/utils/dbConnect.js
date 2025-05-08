import mongoose from "mongoose";
import dotenv from 'dotenv';


// Initialize connection object with optional chaining for isConnected
const connection = {};

// dbConnect function to handle the connection
async function dbConnect() {
  dotenv.config({ path: '.env' });
  
  // Return if db is already connected
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  // Connect to db if not connected
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    connection.isConnected = db.connections[0].readyState;
    console.log("DB connected successfully");
  } catch (error) {
    console.log("DB connection failed", error);
    process.exit(1);
  }

}

export default dbConnect;
