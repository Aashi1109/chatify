import { ObjectId, Schema, model } from "mongoose";

interface IGroups {
  messageId: ObjectId;
}

const groupSchema = new Schema<IGroups>({
  messageId: { type: [Schema.Types.ObjectId], ref: "Message" },
});

const Groups = model<IGroups>("Groups", groupSchema);

export default Groups;
