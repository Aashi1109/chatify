import { IRequestPagination } from "@definitions/interfaces";
import ClientError from "@exceptions/clientError";
import NotFoundError from "@exceptions/notFoundError";
import { createFilterFromParams } from "@lib/helpers";
import { Message } from "@models";
import { RedisCommonCache } from "@redis";
import MessageService from "@services/MessageService";
import { Request, Response } from "express";

const messageCache = new RedisCommonCache();

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
  const { user, conversation, content, sentAt, type, category } = req.body;

  if (!content) {
    throw new ClientError("Message content is missing");
  }

  if (!user || !conversation) {
    throw new ClientError(
      `User or sender id is missing. user id: ${user}, chat id: ${conversation}`
    );
  }

  const createdMessage = await Message.create({
    conversation: conversation,
    user: user,
    content,
    sentAt,
    type,
    category,
  });

  await Promise.allSettled([
    createdMessage.save(),
    messageCache.methods.setString(
      `message:${createdMessage._id}`,
      createdMessage.toObject()
    ),
    3600,
  ]);

  return res.status(201).json({ data: createdMessage, success: true });
};

/**
 * Updates a particular message
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @throws {NotFoundError} Throws a NotFoundError if the room or message with the specified ID is not found.
 */
const updateMessageById = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!messageId || !content) {
    throw new ClientError(`Message id invalid messageId: ${messageId}`);
  }

  if (!content) {
    throw new ClientError("Message content is missing");
  }
  const previousMessage = await Message.findById(messageId);
  if (!previousMessage) {
    throw new NotFoundError(`Message with id: ${messageId} not found`);
  }

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      content,
      isEdited: true,
    },
    { new: true }
  );

  await Promise.allSettled([
    updatedMessage.save(),
    messageCache.methods.setString(
      `message:${updatedMessage._id}`,
      updatedMessage.toObject(),
      3600
    ),
  ]);

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

  const deletedMessage = Message.findByIdAndDelete(messageId);

  await Promise.allSettled([
    deletedMessage,
    messageCache.methods.deleteKey(`message:${messageId}`),
  ]);

  return res.status(204).json({ data: deletedMessage, success: true });
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
  let existingMessage = await messageCache.methods.getKey(
    `message:${messageId}`
  );

  if (!existingMessage) {
    existingMessage = await Message.findById(messageId);
    existingMessage &&
      messageCache.methods.setString(
        `message:${existingMessage._id}`,
        existingMessage.toObject(),
        3600
      );
  }

  if (!existingMessage) {
    throw new NotFoundError(`Message not found`);
  }

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
  const { conversation, user, messageId, not } = req.query;

  const filter = createFilterFromParams({
    conversation,
    user,
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
  getMessageById,
  getMessageByQuery,
  updateMessageById,
};
