import { ObjectId, Schema, model } from "mongoose";
import { IChats } from "../definitions/interfaces";

const chatSchema = new Schema<IChats>(
  {
    messages: {
      type: [Schema.Types.ObjectId],
      ref: "Message",
      required: true,
      default: [],
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Chats = model<IChats>("Chats", chatSchema);

export default Chats;
