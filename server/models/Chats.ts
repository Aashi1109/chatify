import { IChats } from "@definitions/interfaces";
import { Schema, model } from "mongoose";

const chatSchema = new Schema<IChats>(
  {
    messages: {
      type: [Schema.Types.ObjectId],
      ref: "Message",
      required: true,
      default: [],
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 }, { unique: true });

const Chats = model<IChats>("Chats", chatSchema);

export default Chats;
