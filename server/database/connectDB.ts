import mongoose from "mongoose";

const connectDB = async () => {
  const conn = await mongoose.connect("mongodb://localhost:27017/chatify");
  const db = conn.connection;

  db.on("error", console.error.bind(console, "Mongodb connection error"));
  db.once("open", () => {
    console.log(`MongoDB connected on: ${db.host}`);
  });
};

export default connectDB;
