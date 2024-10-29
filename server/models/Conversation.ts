import { IConversation } from "@definitions/interfaces";
import { Schema, model } from "mongoose";

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    // TODO use in future
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isDirectMessage: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

conversationSchema.index(
  { participants: 1, isDirectMessage: 1 },
  {
    unique: true,
    partialFilterExpression: { isDirectMessage: true },
  }
);

conversationSchema.index(
  { name: 1, isGroup: 1 },
  {
    unique: true,
    partialFilterExpression: { isGroup: true },
  }
);

conversationSchema.pre("save", function (next) {
  if (this.isDirectMessage) {
    this.participants.sort();
  }
  next();
});

const Conversation = model<IConversation>("Conversation", conversationSchema);

export default Conversation;
