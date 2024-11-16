import { IMessageStats } from "@definitions/interfaces";
import { Schema, model } from "mongoose";

const messageStatsSchema = new Schema<IMessageStats>(
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

messageStatsSchema.index(
  { user: 1, conversation: 1, message: 1 },
  { unique: true }
);

const MessageStats = model("MessageStats", messageStatsSchema);

export default MessageStats;
