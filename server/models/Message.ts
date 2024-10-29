import { EMessageCategory, EMessageType } from "@definitions/enums";
import { IMessage } from "@definitions/interfaces";
import { Schema, model } from "mongoose";

const messageSchema = new Schema<IMessage>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    content: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    seenAt: { type: Date },
    type: {
      type: String,
      enum: EMessageType,
      required: true,
      default: EMessageType.Text,
    },
    category: {
      type: String,
      enum: EMessageCategory,
      default: EMessageCategory.User,
    },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = model<IMessage>("Message", messageSchema);

export default Message;
