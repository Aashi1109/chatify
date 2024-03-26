import { model, Schema } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  profilePic: { type: String },
  about: { type: String },
  createdAt: { type: Date, default: Date.now() },
});

const User = model("User", userSchema);

export default User;
