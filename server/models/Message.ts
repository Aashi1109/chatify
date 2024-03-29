import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    content: { type: String, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "ChatRoom" },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = model("Message", messageSchema);

export default Message;
