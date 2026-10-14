import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/verdant_carts";
  try {
    await mongoose.connect(uri);
    console.log(`[cart-service] connected to ${uri}`);
  } catch (err) {
    console.error("[cart-service] db connection failed:", err.message);
    process.exit(1);
  }
}
