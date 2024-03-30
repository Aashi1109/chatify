import ChatRoom from "../models/ChatRooms";

/**
 * Retrieves a chat room by its unique identifier.
 * @param {string} roomId - The unique identifier of the chat room.
 * @returns {Promise<InstanceType<typeof ChatRoom>>} A promise that resolves to the chat room instance.
 */
const getRoomById = async (
  roomId: string
): Promise<InstanceType<typeof ChatRoom>> => {
  const existingRoom = await ChatRoom.findById(roomId);
  return existingRoom;
};

/**
 * Retrieves all chat rooms.
 * @returns {Promise<Array<InstanceType<typeof ChatRoom>>>} A promise that resolves to an array of chat room instances.
 */
const getAllRooms = async (): Promise<Array<InstanceType<typeof ChatRoom>>> => {
  const allRooms = await ChatRoom.find();
  return allRooms;
};

/**
 * Creates a new chat room.
 * @param {string} roomName - The name of the chat room.
 * @param {string} description - The description of the chat room.
 * @returns {Promise<InstanceType<typeof ChatRoom>>} A promise that resolves to the newly created chat room instance.
 */
const createRoom = async (roomName: string, description: string) => {
  const newRoom = new ChatRoom({
    roomName,
    description,
  });
  return await newRoom.save();
};

/**
 * Deletes a chat room by its unique identifier.
 * @param {string} roomId - The unique identifier of the chat room to be deleted.
 * @returns {Promise<InstanceType<typeof ChatRoom>>} A promise that resolves to the deleted chat room instance.
 */
const deleteRoomById = async (
  roomId: string
): Promise<InstanceType<typeof ChatRoom>> => {
  return await ChatRoom.findByIdAndDelete(roomId);
};

/**
 * Updates a chat room by its unique identifier.
 * @param {string} roomId - The unique identifier of the chat room to be updated.
 * @param {string} roomName - The new name of the chat room.
 * @param {string} description - The new description of the chat room.
 * @returns {Promise<InstanceType<typeof ChatRoom>>} A promise that resolves to the updated chat room instance.
 */
const updateRoomById = async (
  roomId: string,
  roomName: string,
  description: string,

): Promise<InstanceType<typeof ChatRoom>> => {
  const updatedRoom = await ChatRoom.findByIdAndUpdate(
    {_id: roomId},
    {
      roomName,
      description,
    },
    { new: true }
  );
  return updatedRoom;
};

export { getRoomById, getAllRooms, createRoom, deleteRoomById, updateRoomById };
