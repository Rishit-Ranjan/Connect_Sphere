import { connect } from 'mongoose';

async function connectDB() {
  try {
    await connect(process.env.MONGO_URI, {
      // Recommended options for MongoDB Atlas
      // useNewUrlParser: true,   // enabled by default in mongoose 8
      // useUnifiedTopology: true, // enabled by default in mongoose 8
    });
    console.log('MongoDB Atlas connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

export default connectDB;