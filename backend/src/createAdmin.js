import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'bcryptjs';
import User from './models/User.js';

const { hash } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

const requiredFields = ['MONGO_URI', 'ADMIN_NAME', 'ADMIN_HANDLE', 'ADMIN_EMAIL', 'ADMIN_EMPLOYEE_ID', 'ADMIN_PASSWORD'];
const missingFields = requiredFields.filter((field) => !process.env[field]?.trim());

if (missingFields.length) {
  console.error(`Missing required admin configuration: ${missingFields.join(', ')}`);
  process.exit(1);
}

if (process.env.ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters long.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = {
    name: process.env.ADMIN_NAME.trim(),
    handle: process.env.ADMIN_HANDLE.trim().toLowerCase(),
    email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
    employeeId: process.env.ADMIN_EMPLOYEE_ID.trim().toLowerCase(),
    password: await hash(process.env.ADMIN_PASSWORD, 10),
    role: 'admin',
    department: process.env.ADMIN_DEPARTMENT?.trim() || ''
  };

  const existingAccount = await User.findOne({
    $or: [
      { email: admin.email },
      { handle: admin.handle },
      { employeeId: admin.employeeId }
    ]
  });

  if (existingAccount) {
    throw new Error('An account already uses the configured admin email, handle, or employee ID.');
  }

  await User.create(admin);
  console.log('Admin account created.');
} catch (error) {
  console.error('Admin account creation failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
