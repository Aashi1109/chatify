import { Schema, model } from "mongoose";

const roomMembers = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: "Room" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  isAdmin: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
});

const RoomMembers = model("RoomMembers", roomMembers);

export default RoomMembers;
