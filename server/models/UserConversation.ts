import { IUserConversationMessage } from "@definitions/interfaces";
import { Schema, model } from "mongoose";

const userConversationMessageSchema = new Schema<IUserConversationMessage>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
    message: { type: Schema.Types.ObjectId, ref: "Message" },
    readAt: { type: Date },
    deliveredAt: { type: Date },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

userConversationMessageSchema.index(
  { user: 1, conversation: 1, message: 1 },
  { unique: true }
);

const UserConversationMessage = model(
  "UserConversationMessage",
  userConversationMessageSchema
);

export default UserConversationMessage;
