import { IConversation, IRequestPagination } from "@definitions/interfaces";
import { NotFoundError } from "@exceptions";
import ClientError from "@exceptions/clientError";
import { createFilterFromParams, updateArrayField } from "@lib/helpers";
import { Conversation, Message } from "@models";
import ConversationService from "@services/ConversationService";

import { Request, Response } from "express";

/**
 * Creates a new conversation with the provided chatId and userId.
 * @param {Request} req - The request object containing the room information.
 * @param {Response} res - The response object for sending responses.
 * @throws {Error} Throws an error if the name or description is missing.
 */
export const createConversation = async (req: Request, res: Response) => {
  const { participants } = req.body as IConversation;

  const existingConversation = await Conversation.findOne({
    participants: { $in: participants },
    isGroup: participants.length > 2,
    isDirectMessage: participants.length === 2,
  });

  if (existingConversation)
    throw new ClientError("Conversation already exists");

  const newChat = new Conversation(req.body);
  await newChat.save();
  res.status(201).json({ success: true, data: newChat });
};

/**
 * Retrieves a chat by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the chat with the specified ID is not found.
 */
export const getConversationById = async (
  req: IRequestPagination,
  res: Response
) => {
  const { conversationId } = req.params;

  const userChat = await Conversation.findById(conversationId);

  res.json({ success: true, data: userChat });
};

/**
 * Retrieves a chat by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the chat with the specified ID is not found.
 */
export const getConversationByQuery = async (
  req: IRequestPagination,
  res: Response
) => {
  let { chatId, participants, not } = req.query;

  const filter = createFilterFromParams({
    _id: chatId,
    participants,
  });

  const userChats = await ConversationService.getConversationByFilter(
    filter,
    req.pagination,
    not as string
  );

  res.json({ success: true, data: userChats });
};

/**
 * Updates a conversation by its ID in the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object for sending responses.
 */
export const updateConversationById = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const {
    participants,
    operation,
    isDirectMessage,
    isGroup,
    isPrivate,
    name,
    description,
  } = req.body as Partial<IConversation>;

  const existingChat = await Conversation.findOne({ _id: conversationId });

  if (!existingChat) {
    throw new NotFoundError(
      `Conversation with id: ${conversationId} not found`
    );
  }

  if (participants.length) {
    existingChat.participants = updateArrayField(
      existingChat.participants,
      participants,
      operation
    );
  }

  existingChat.description = description || existingChat.description;
  existingChat.name = name || existingChat.name;
  existingChat.isDirectMessage =
    isDirectMessage || existingChat.isDirectMessage;
  existingChat.isGroup = isGroup || existingChat.isGroup;
  existingChat.isPrivate = isPrivate || existingChat.isPrivate;

  await existingChat.save();

  res.json({ success: true, data: existingChat });
};

/**
 * Deletes a room by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the room with the specified ID is not found.
 */
export const deleteConversationById = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  // TODO write hooks for deletion of user chats
  const userChatDelete = Conversation.findOneAndDelete({ _id: conversationId });
  const messagesDelete = Message.deleteMany({ conversationId });

  res.status(200).json({
    message: "Chats deleted successfully",
    data: { userChatDelete, messagesDelete },
    success: true,
  });
};
