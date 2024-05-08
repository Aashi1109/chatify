import { ObjectId, Schema, model } from "mongoose";
import { IGroups } from "../definitions/interfaces";

const groupSchema = new Schema<IGroups>(
  {
    messages: { type: [Schema.Types.ObjectId], ref: "Message" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: {
      url: { type: String, trim: true },
      filename: { type: String },
      pubicId: { type: String, trim: true },
      fileDataId: { type: String, trim: true, required: true },
    },
    creatorId: { type: String, required: true },
    users: { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true }
);

const Groups = model<IGroups>("Groups", groupSchema);

export default Groups;
