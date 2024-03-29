import ChatRoom from "../models/ChatRooms";

const getRoomById = async (
  roomId: string
): Promise<InstanceType<typeof ChatRoom>> => {
  const existingRoom = await ChatRoom.findById(roomId);
  return existingRoom;
};

const getAllRooms = async (): Promise<Array<InstanceType<typeof ChatRoom>>> => {
  const allRooms = await ChatRoom.find();
  return allRooms;
};

const createRoom = (
  roomName: string,
  description: string,
  participants: Array<string>
) => {
  const newRoom = new ChatRoom({
    roomName,
    description,
    participants,
  });
  return newRoom.save();
};

const deleteRoomById = async (
  roomId: string
): Promise<InstanceType<typeof ChatRoom>> => {
  return await ChatRoom.findByIdAndDelete(roomId);
};

const updateRoomById = async (
  roomId: string,
  roomName: string,
  description: string,
  participants: Array<string>
): Promise<InstanceType<typeof ChatRoom>> => {
  const updatedRoom = await ChatRoom.findByIdAndUpdate(
    roomId,
    {
      roomName,
      description,
      participants,
    },
    { new: true }
  );
  return updatedRoom;
};

module.exports = {
  getRoomById,
  getAllRooms,
  createRoom,
  deleteRoomById,
  updateRoomById,
};
