import Message from "../models/Message";

const getAllMessagesForRoom = async (
  roomId: string
): Promise<Array<InstanceType<typeof Message>>> => {
  const roomMessages = await Message.find({ roomId }).sort({ createdAt: 1 });
  return roomMessages;
};

const createMessageForRoom = async (
  roomId: string,
  message: string,
  senderId: string
): Promise<InstanceType<typeof Message>> => {
  const newMessage = new Message({ content: message, roomId, senderId });
  const savedMessage = await newMessage.save();
  return savedMessage;
};

const updateMessageForRoom = async (
  roomId: string,
  messageId: string,
  message: string
): Promise<InstanceType<typeof Message>> => {
  const updatedMessage = await Message.findOneAndUpdate(
    { roomId, _id: messageId },
    { content: message, isEdited: true },
    { new: true }
  );
  return updatedMessage;
};

const deleteMessageForRoom = async (
  roomId: string,
  messageId: string
): Promise<InstanceType<typeof Message>> => {
  const deletedMessage = await Message.findOneAndDelete({
    roomId,
    _id: messageId,
  });
  return deletedMessage;
};

export {
  getAllMessagesForRoom,
  createMessageForRoom,
  deleteMessageForRoom,
  updateMessageForRoom,
};
