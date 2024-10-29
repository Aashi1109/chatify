import { IRequestPagination } from "@definitions/interfaces";
import ClientError from "@exceptions/clientError";
import NotFoundError from "@exceptions/notFoundError";
import { createFilterFromParams } from "@lib/helpers";
import MessageService from "@services/MessageService";
import { Request, Response } from "express";

/**
 * Create message
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @throws {ClientError} Throws a ClientError if userId, chatId or content not provided.
 * @return {Promise<Response>} Promise resolved when message is created
 */
const createMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
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
    conversation: chatId,
    user: userId,
    content,
    sentAt,
    groupId,
    type,
  });
  return res.status(201).json({ data: createdMessage, success: true });
};

/**
 * Get all the messages
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @return {Promise<Response>} Promise resolved with all the messages
 */
const getAllMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const messages = await MessageService.getAll();

  return res.status(200).json({ data: messages, success: true });
};

/**
 * Updates a particular message
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
  return res.status(200).json({ data: updatedMessage, success: true });
};

/**
 * Delete specific message
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @return {Promise<Response>} Promise resolved with deleted message data
 */
const deleteMessageById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const deleteRoom = await MessageService.deleteById(messageId);
  return res.status(204).json({ data: deleteRoom, success: true });
};

/**
 * Get a message by its id
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @return {Promise<Response>} Promise resolved with message data for that id
 */
const getMessageById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;
  const existingMessage = await MessageService.getById(messageId);

  return res.status(200).json({ data: existingMessage, success: true });
};

/**
 * Get messages by query parameters
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @return {Promise<Response>} Promise resolved with messages data for passed query parameters
 */
const getMessageByQuery = async (
  req: IRequestPagination,
  res: Response
): Promise<Response> => {
  const { chatId, userId, groupId, messageId, not } = req.query;

  const filter = createFilterFromParams({
    chatId,
    userId,
    groupId,
    _id: messageId,
  });

  const existingMessage = await MessageService.getMessagesByFilter(
    filter,
    req.pagination,
    not as string
  );

  return res.status(200).json({ data: existingMessage, success: true });
};

export {
  createMessage,
  deleteMessageById,
  getAllMessages,
  getMessageById,
  getMessageByQuery,
  updateMessageById,
};
