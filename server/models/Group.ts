import { model, Schema } from "mongoose";

const groupSchema = new Schema({
  name: { type: String, unique: true },
  about: { type: String },
  createdAt: { type: Date, default: Date.now() },
  participants: { type: Schema.Types.ObjectId, ref: "User" },
});

const Group = model("Group", groupSchema);

export default Group;
