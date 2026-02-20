import mongoose from "mongoose";

export async function connectToDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log("Using existing connection : ", mongoose.connection.name);
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to database : ", mongoose.connection.name);
  } catch (err) {
    console.error("Database connection error:", err);
    throw new Error(`Failed to connect to the database: ${err.message}`);
  }
}
