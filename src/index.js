import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
