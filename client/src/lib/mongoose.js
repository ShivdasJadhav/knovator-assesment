import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error("❌ Missing MONGO_URI env variable");

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected (Next.js)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    isConnected = false;
    throw err;
  }
};
