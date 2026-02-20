import mongoose from "mongoose";

export async function connectToDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO);
  } catch (err) {
    throw new Error(`Failed to connect to the database: ${err.message}`);
  }
}
