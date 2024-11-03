import { model, Schema } from "mongoose";
import { IUser } from "@definitions/interfaces";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true },
    profileImage: {
      url: { type: String, trim: true },
      filename: { type: String },
      pubicId: { type: String, trim: true },
      fileDataId: { type: Schema.Types.ObjectId, ref: "FileData" },
    },
    about: { type: String, trim: true },
    password: { type: String, required: true, trim: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
