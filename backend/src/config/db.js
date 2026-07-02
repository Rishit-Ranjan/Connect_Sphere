import { connect } from 'mongoose';

async function connectDB() {
  try {
    await connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

export default connectDB;