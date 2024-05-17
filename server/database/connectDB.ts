import mongoose from "mongoose";
import config from "@config";

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * @async
 * @function connectDB
 * @returns {Promise<void>} A Promise that resolves when the connection is successfully established.
 * @throws {Error} If there is an error connecting to the database.
 */
const connectDB = async () => {
  try {
    // Connect to the MongoDB database using Mongoose
    const conn = await mongoose.connect(config.dbUrl);
    const db = conn.connection;

    // Event handler for database connection errors
    db.on("error", console.error.bind(console, "Mongodb connection error"));

    // Event handler for successful database connection
    db.once("open", () => {
      console.log(`MongoDB connected on: ${db.host}`);
    });
  } catch (error) {
    // Throw an error if there is a problem connecting to the database
    throw new Error(`Error connecting to MongoDB: ${error.message}`);
  }
};

export default connectDB;
