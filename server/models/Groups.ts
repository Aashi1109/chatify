import { IGroups } from "@definitions/interfaces";
import { Schema, model } from "mongoose";

const groupSchema = new Schema<IGroups>(
  {
    messages: { type: [Schema.Types.ObjectId], ref: "Message" },
    name: { type: String, required: true },
    description: { type: String },
    image: {
      type: {
        url: { type: String, trim: true },
        filename: { type: String },
        pubicId: { type: String, trim: true },
        fileDataId: { type: String, trim: true },
      },
      required: false,
    },
    creatorId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const Groups = model<IGroups>("Groups", groupSchema);

export default Groups;
