import { model, Schema } from "mongoose";
import { IUserGroups } from "../definitions/interfaces";

const usergroupSchema = new Schema<IUserGroups>({
  userId: { type: Schema.Types.ObjectId, required: true },
  groupId: { type: Schema.Types.ObjectId, required: true },
});

const UserGroups = model<IUserGroups>("UserGroups", usergroupSchema);

export default UserGroups;
