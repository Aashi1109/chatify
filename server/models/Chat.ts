import { ObjectId, Schema, model } from "mongoose";

interface IChats {
  messageId: ObjectId[];
  userId: ObjectId;
}

const chatSchema = new Schema<IChats>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  messageId: { type: [Schema.Types.ObjectId], ref: "Message", required: true },
});

const Chats = model<IChats>("Chats", chatSchema);
export default Chats;
