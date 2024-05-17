import ClientError from "@exceptions/clientError";
import NotFoundError from "@exceptions/notFoundError";
import MessageService from "@services/MessageService";
import { Request, Response } from "express";

/**
 * Create a new message for a particular room
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @throws {NotFoundError} Throws a NotFoundError if the room or user with the specified ID is not found.
 */
const createMessage = async (req: Request, res: Response) => {
  const { userId, chatId, content, sentAt, groupId, type } = req.body;

  if (!content) {
    throw new ClientError("Message content is missing");
  }

  if (!userId || !chatId) {
    throw new ClientError(
      `User or sender id is missing. user id: ${userId}, chat id: ${chatId}`
    );
  }

  const createdMessage = await MessageService.create({
    chatId,
    userId,
    content,
    sentAt,
    groupId,
    type,
  });
  res.status(201).json({ data: createdMessage });
};

/**
 * Get all the messages for a room
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 */
const getAllMessages = async (req: Request, res: Response) => {
  const messages = await MessageService.getAll();

  res.status(200).json({ data: messages });
};

/**
 * Updates message for a room
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @throws {NotFoundError} Throws a NotFoundError if the room or message with the specified ID is not found.
 */
const updateMessageById = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { content, seenAt, deliveredAt } = req.body;

  if (!messageId || !content) {
    throw new ClientError(`Message id invalid messageId: ${messageId}`);
  }

  if (!content) {
    throw new ClientError("Message content is missing");
  }
  const previousMessage = await MessageService.getById(messageId);
  if (!previousMessage.length) {
    throw new NotFoundError(`Message with id: ${messageId} not found`);
  }

  const updatedMessage = await MessageService.updateById(
    messageId,
    content,
    seenAt || previousMessage[0]?.seenAt,
    deliveredAt || previousMessage[0]?.deliveredAt
  );
  res.status(200).json({ data: updatedMessage });
};

/**
 * Delete message for a specific room
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 */
const deleteMessageById = async (req: Request, res: Response) => {
  const { messageId } = req.params;

  const deleteRoom = await MessageService.deleteById(messageId);
  res.status(204).json({ data: deleteRoom });
};

/**
 * Get a message by its id
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 */
const getMessageById = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const existingMessage = await MessageService.getById(messageId);

  res.status(200).json({ data: existingMessage });
};

/**
 * Get a messages for a specific chat
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 */
const getMessageByQuery = async (req: Request, res: Response) => {
  const {
    chatId,
    userId,
    groupId,
    messageId,
    limit,
    populate,
    sortBy,
    sortOrder,
    pageNumber,
  } = req.query;

  if (!chatId && !userId && !groupId && !messageId) {
    throw new ClientError(
      `chatId or userId or groupId or messageId not specified`
    );
  }

  const messageFilter: {
    chatId?: string;
    userId?: string;
    groupId?: string;
    _id?: string;
  } = {};
  if (chatId) {
    messageFilter.chatId = chatId as string;
  }
  if (userId) {
    messageFilter.userId = userId as string;
  }
  if (groupId) {
    messageFilter.groupId = groupId as string;
  }
  if (messageId) {
    messageFilter._id = messageId as string;
  }

  const existingMessage = await MessageService.getMessagesByFilter(
    messageFilter,
    +limit,
    sortBy !== "createdAt" && sortBy !== "updatedAt" ? null : sortBy,
    sortOrder !== "asc" && sortOrder !== "desc" ? null : sortOrder,
    !!populate,
    +pageNumber
  );

  res.status(200).json({ data: existingMessage });
};

export {
  createMessage,
  deleteMessageById,
  getAllMessages,
  getMessageById,
  getMessageByQuery,
  updateMessageById,
};
