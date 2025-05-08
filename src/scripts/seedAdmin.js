import mongoose from 'mongoose';
import dbConnect from '../utils/dbConnect.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  try {
    // Connect to the database
    await dbConnect();

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('Admin already exists. Skipping seeding.');
      process.exit();
    }

    const password = "admin@786";
    // const hashedPassword = await bcrypt.hash(password, 10);
    // Admin data
    const adminData = {
      name: 'Main Admin',
      email: 'mufaddal.lashkar@gmail.com',
      password: password,
      role: 'admin',
    };

    // Create and save the new admin
    const newAdmin = new User(adminData);
    await newAdmin.save();

    console.log('✅ Default admin created!');
    process.exit();

  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
