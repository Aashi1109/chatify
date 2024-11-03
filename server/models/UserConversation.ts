import { Schema, model } from "mongoose";

const userConversationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
  lastReadMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  unreadMessagesCount: { type: Number, default: 0 },
});

const UserConversation = model("UserConversation", userConversationSchema);

export default UserConversation;
