import { model, Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  profileImage: { type: String, trim: true },
  about: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  password: { type: String, required: true, trim: true },
  salt: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

const User = model("User", userSchema);

export default User;
