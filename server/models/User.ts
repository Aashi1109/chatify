import { model, Schema } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  profileImage: { type: String },
  about: { type: String },
  createdAt: { type: Date, default: Date.now },
  password: { type: String, required: true },
});

const User = model("User", userSchema);

export default User;
