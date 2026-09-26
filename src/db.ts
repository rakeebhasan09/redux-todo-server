import mongoose from 'mongoose';

export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/redux_todo');
}
