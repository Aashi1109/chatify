import { Schema, model } from "mongoose";

const chatRoomSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const ChatRoom = model("ChatRoom", chatRoomSchema);

export default ChatRoom;
