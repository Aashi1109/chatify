import { Request, Response } from "express";
import {
  createMessageForRoom,
  deleteMessageForRoom,
  getAllMessagesForRoom,
  getMessageById,
  updateMessageForRoom,
} from "../state/messages";
import NotFoundError from "../exceptions/notFoundError";
import { getRoomById } from "../state/chatroom";
import { getUserById } from "../state/user";
import ClientError from "../exceptions/clientError";

/**
 * Create a new message for a particular room
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @throws {NotFoundError} Throws a NotFoundError if the room or user with the specified ID is not found.
 */
const createMessage = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { message, senderId } = req.body;

  if (!message) {
    throw new ClientError("Message content is missing");
  }

  if (!senderId || !roomId) {
    throw new ClientError(
      `Room or sender id is missing room id: ${roomId}, user id: ${senderId}`
    );
  }

  const existingRoom = await getRoomById(roomId);
  const existingUser = await getUserById(senderId);
  if (!existingRoom || !existingUser) {
    throw new NotFoundError(`Room or sender invalid`);
  }

  const createdMessage = await createMessageForRoom(roomId, message, senderId);
  res.status(201).json({ data: createdMessage });
};

/**
 * Get all the messages for a room
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @throws {NotFoundError} Throws a NotFoundError if the room with the specified ID is not found.
 */
const getAll = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const existingRoom = await getRoomById(roomId);
  if (!existingRoom) {
    throw new NotFoundError(`Room id is invalid: ${roomId}`);
  }

  const messages = await getAllMessagesForRoom(roomId);
  res.status(200).json({ data: messages });
};

/**
 * Updates message for a room
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @throws {NotFoundError} Throws a NotFoundError if the room or message with the specified ID is not found.
 */
const updateMessage = async (req: Request, res: Response) => {
  const { roomId, messageId } = req.params;
  const { message } = req.body;

  if (!messageId || !roomId) {
    throw new ClientError(
      `Room or message id is missing room id: ${roomId}, message id: ${messageId}`
    );
  }

  if (!message) {
    throw new ClientError("Message content is missing");
  }

  const existingRoom = await getRoomById(roomId);
  const existingMessage = await getMessageById(messageId);
  if (!existingRoom || !existingMessage) {
    throw new NotFoundError(`Room or message not found`);
  }

  const updatedMessage = await updateMessageForRoom(roomId, messageId, message);
  res.status(200).json({ data: updatedMessage });
};

/**
 * Delete message for a specific room
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 */
const deleteMessage = async (req: Request, res: Response) => {
  const { roomId, messageId } = req.params;

  const deleteRoom = await deleteMessageForRoom(roomId, messageId);
  res.status(204).json({ data: deleteRoom });
};

/**
 * Get a message by its id
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 */
const getById = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const existingMessage = await getMessageById(messageId);

  res.status(200).json({ data: existingMessage });
};

export { createMessage, getAll, deleteMessage, updateMessage, getById };
