import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profileImage: { type: String, trim: true },
    about: { type: String, trim: true },
    password: { type: String, required: true, trim: true },
    salt: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
