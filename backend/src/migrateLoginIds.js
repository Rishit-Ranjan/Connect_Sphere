import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing. Check backend/.env');
  process.exit(1);
}

const demoAccounts = [
  {
    email: 'admin@connectsphere.ac.in',
    role: 'admin',
    employeeId: 'EMP-1001'
  },
  {
    email: 'test@connectsphere.edu',
    role: 'student',
    registrationNumber: 'TEST-2026'
  }
];

try {
  await mongoose.connect(process.env.MONGO_URI);

  for (const account of demoAccounts) {
    const { email, role, ...loginId } = account;
    const result = await User.updateOne({ email, role }, { $set: loginId });
    if (result.matchedCount !== 1) {
      throw new Error(`Expected one existing ${role} demo account for ${email}, found ${result.matchedCount}.`);
    }
  }

  console.log('Existing demo accounts updated with their login IDs.');
  console.log('Admin login ID: EMP-1001');
  console.log('Student login ID: TEST-2026');
} catch (error) {
  console.error('Login ID migration failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
