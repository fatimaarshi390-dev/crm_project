// scripts/createAdmin.ts
import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../model/User';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('✅ Admin already exists!');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await User.create({
      name: "Admin",
      email: "admin@yourcrm.com",
      employeeId: "ADM001",
      role: "admin",
      password: hashedPassword,
      department: "Administration",
      isActive: true,
      permissions: ["all"],
    });

    console.log('🎉 Admin Created Successfully!');
    console.log('Email     :', admin.email);
    console.log('Password  :', 'admin123');
    console.log('Employee ID:', admin.employeeId);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

createAdmin();