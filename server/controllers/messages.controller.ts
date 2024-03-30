import { Request, Response } from "express";
import {
  createMessageForRoom,
  getAllMessagesForRoom,
  updateMessageForRoom,
} from "../state/messages";
import NotFoundError from "../exceptions/notFoundError";
import { getRoomById } from "../state/chatroom";
import { getUserById } from "../state/user";

const createMessage = async (req: Request, res: Response) => {
  const { roomId, message, senderId } = req.body;

  const existingRoom = await getRoomById(roomId);
  const existingUser = await getUserById(senderId);
  if (!existingRoom || !existingUser) {
    throw new NotFoundError(
      `Room or sender id is invalid room id: ${roomId}, user id: ${senderId}`
    );
  }

  const createdMessage = await createMessageForRoom(roomId, message, senderId);
  res.status(201).json({ data: createdMessage });
};

const getAll = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const existingRoom = await getRoomById(roomId);
  if (!existingRoom) {
    throw new NotFoundError(`Room id is invalid: ${roomId}`);
  }

  const messages = await getAllMessagesForRoom(roomId);
  res.status(200).json({ data: messages });
};

const updateMessage = async (req: Request, res: Response) => {
  const { roomId, messageId } = req.params;
  const { message } = req.body;

  const existingRoom = await getRoomById(roomId);
  const existingMessage = await getMessageById(messageId);
  if (!existingRoom) {
    throw new NotFoundError(`Room id is invalid: ${roomId}`);
  }

  const updatedMessage = await updateMessageForRoom(roomId, messageId, message);
  res.status(200).json({ data: updatedMessage });
};

export default {
  create,
  getAll,
};
