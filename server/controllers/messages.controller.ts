import { ICustomRequest, IRequestPagination } from "@definitions/interfaces";
import ClientError from "@exceptions/clientError";
import NotFoundError from "@exceptions/notFoundError";
import { createFilterFromParams } from "@lib/helpers";
import { Message } from "@models";
import MessageService from "@services/MessageService";
import { Response } from "express";
import { RedisCommonCache } from "@redis";

const socketCache = new RedisCommonCache("sct");

/**
 * Create message
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @throws {ClientError} Throws a ClientError if userId, chatId or content not provided.
 * @return {Promise<Response>} Promise resolved when message is created
 */
const createMessage = async (
  req: ICustomRequest,
  res: Response
): Promise<Response> => {
  const { conversationId } = req.params;
  const { user, content, sentAt, type, category } = req.body;

  if (!content) {
    throw new ClientError("Message content is missing");
  }

  if (!user) {
    throw new ClientError(`User id is missing. user id: ${user}`);
  }

  const createdMessage = await Message.create({
    conversation: conversationId,
    user: user,
    content,
    sentAt,
    type,
    category,
  });
  await createdMessage.save();

  return res.status(201).json({ data: createdMessage, success: true });
};

/**
 * Updates a particular message
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @throws {NotFoundError} Throws a NotFoundError if the room or message with the specified ID is not found.
 */
const updateMessageById = async (req: ICustomRequest, res: Response) => {
  const { messageId } = req.params;
  const { content, deletedAt } = req.body;

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
      deletedAt: previousMessage.deletedAt || deletedAt,
    },
    { new: true }
  );

  await updatedMessage.save();

  return res.status(200).json({ data: updatedMessage, success: true });
};

/**
 * Delete specific message
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @return {Promise<Response>} Promise resolved with deleted message data
 */
const deleteMessageById = async (
  req: ICustomRequest,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const deletedMessage = await Message.findByIdAndDelete(messageId);

  return res.status(204).json({ data: deletedMessage, success: true });
};

/**
 * Get a message by its id
 * @param {Request} req Express Request object
 * @param {Response} res Express Response object
 * @return {Promise<Response>} Promise resolved with message data for that id
 */
const getMessageById = async (
  req: ICustomRequest,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const existingMessage = await Message.findById(messageId);

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
  req: ICustomRequest & IRequestPagination,
  res: Response
): Promise<Response> => {
  const { conversationId } = req.params;
  const { user, messageId, self } = req.query;

  const filter = createFilterFromParams({
    conversation: conversationId,
    user,
    _id: messageId,
  });

  const existingMessage = await MessageService.getMessagesByFilter(
    filter as any,
    req,
    !!self
  );

  // get messages from redis too if user has instantly opened the chatWindow
  const messages = await socketCache.methods.getAllListItems({
    pattern: `messages:create`,
  });

  const unsavedMessages = messages.filter(
    (message) => message.conversation === conversationId
  );

  // Only sort unsavedMessages
  if (unsavedMessages.length) {
    unsavedMessages.sort((a, b) => {
      const valueA = a[req.pagination.sortBy];
      const valueB = b[req.pagination.sortBy];

      if (req.pagination.sortOrder === "desc") {
        return valueB > valueA ? 1 : -1;
      }
      return valueA > valueB ? 1 : -1;
    });
  }

  // Combine based on sort order
  let allMessages =
    req.pagination.sortOrder !== "desc"
      ? [...existingMessage, ...unsavedMessages]
      : [...unsavedMessages, ...existingMessage];

  return res.status(200).json({ data: allMessages, success: true });
};

export {
  createMessage,
  deleteMessageById,
  getMessageById,
  getMessageByQuery,
  updateMessageById,
};
