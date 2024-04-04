import Message from "../models/Message";

/**
 * Retrieves all messages for a given room from the database.
 * @async
 * @function getAllMessagesForRoom
 * @param {string} roomId - The ID of the room to retrieve messages for.
 * @returns {Promise<Array<Message>>} A Promise that resolves to an array of messages for the room.
 */
const getAllMessagesForRoom = async (
  roomId: string
): Promise<Array<InstanceType<typeof Message>>> => {
  const roomMessages = (await Message.find({ roomId })
    .sort({ createdAt: 1 })
    .lean()) as Array<InstanceType<typeof Message>>;
  return roomMessages;
};

/**
 * Retrieve message given for a particular id
 * @param messageId The ID of the message to retrieve
 * @returns {Promise<Message>} A Promise that resolves to message
 */
const getMessageById = async (
  messageId: string
): Promise<InstanceType<typeof Message>> => {
  const message = await Message.findById({ _id: messageId });
  return message;
};

/**
 * Creates a new message for a given room and saves it to the database.
 * @async
 * @function createMessageForRoom
 * @param {string} roomId - The ID of the room to create the message for.
 * @param {string} message - The content of the message.
 * @param {string} senderId - The ID of the message sender.
 * @returns {Promise<Message>} A Promise that resolves to the newly created message.
 */
const createMessageForRoom = async (
  roomId: string,
  message: string,
  senderId: string
): Promise<InstanceType<typeof Message>> => {
  const newMessage = new Message({ content: message, roomId, senderId });
  const savedMessage = await newMessage.save();
  return savedMessage;
};

/**
 * Updates an existing message for a given room in the database.
 * @async
 * @function updateMessageForRoom
 * @param {string} roomId - The ID of the room containing the message to update.
 * @param {string} messageId - The ID of the message to update.
 * @param {string} message - The new content of the message.
 * @returns {Promise<Message>} A Promise that resolves to the updated message.
 */
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

/**
 * Deletes a message for a given room from the database.
 * @async
 * @function deleteMessageForRoom
 * @param {string} roomId - The ID of the room containing the message to delete.
 * @param {string} messageId - The ID of the message to delete.
 * @returns {Promise<Message>} A Promise that resolves to the deleted message.
 */
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
  getMessageById,
};
