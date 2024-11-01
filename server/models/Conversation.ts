import { EConversationTypes } from "@definitions/enums";
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
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      url: { type: String, trim: true },
      filename: { type: String },
      pubicId: { type: String, trim: true },
      fileDataId: { type: Schema.Types.ObjectId, ref: "FileData" },
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    type: {
      type: String,
      enum: EConversationTypes,
      required: true,
    },
  },
  { timestamps: true }
);

conversationSchema.pre("save", function (next) {
  if (this.type === EConversationTypes.PRIVATE) {
    this.participants.sort();
  }
  next();
});

const Conversation = model<IConversation>("Conversation", conversationSchema);

export default Conversation;
