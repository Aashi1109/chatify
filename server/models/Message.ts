import { EMessageType } from "@definitions/enums";
import { IMessage } from "@definitions/interfaces";
import { Schema, model } from "mongoose";

const messageSchema = new Schema<IMessage>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    chatId: { type: Schema.Types.ObjectId, ref: "Chats" },
    content: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    seenAt: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: EMessageType,
      required: true,
      default: EMessageType.Text,
    },
    isEdited: { type: Boolean, required: true, default: false },
    groupId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

const Message = model<IMessage>("Message", messageSchema);

export default Message;
