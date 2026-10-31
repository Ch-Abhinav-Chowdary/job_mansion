const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/env');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const email = (ADMIN_EMAIL || 'admin@jobmansion.com').toLowerCase().trim();
    const password = ADMIN_PASSWORD || 'Admin@12345';
    const name = ADMIN_NAME || 'Job Mansion Admin';

    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected.');

    // Check if an admin user already exists with this email or admin role
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin user already exists (${existingAdmin.email}, role: ${existingAdmin.role}). No action needed.`);
      await mongoose.connection.close();
      console.log('Database connection closed.');
      process.exit(0);
    }

    // Hash password with bcrypt cost factor 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
    });

    console.log(`Admin user successfully created!`);
    console.log(`  ID:    ${newAdmin._id}`);
    console.log(`  Name:  ${newAdmin.name}`);
    console.log(`  Email: ${newAdmin.email}`);
    console.log(`  Role:  ${newAdmin.role}`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    try {
      await mongoose.connection.close();
    } catch (closeErr) {
      // ignore
    }
    process.exit(1);
  }
};

seedAdmin();
