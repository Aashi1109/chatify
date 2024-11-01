import { EConversationTypes } from "@definitions/enums";
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
  const { participants, type } = req.body as IConversation;

  if (type === EConversationTypes.PRIVATE) {
    const existingConversation =
      await ConversationService.getConversationByFilter({
        participants: participants as any,
        type: EConversationTypes.PRIVATE,
      });

    if (existingConversation?.length)
      throw new ClientError("Conversation already exists");
  }

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
  let { conversationId, not, type, participants } = req.body;

  const filter = createFilterFromParams({
    _id: conversationId,
    participants,
    type,
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
    participantsToAlter,
    operation,
    name,
    description,
    image,
    lastMessage,
    type,
  } = req.body as Partial<{ participantsToAlter: string[] } & IConversation>;

  const existingChat = await Conversation.findOne({ _id: conversationId });

  if (!existingChat) {
    throw new NotFoundError(
      `Conversation with id: ${conversationId} not found`
    );
  }

  if (participantsToAlter.length) {
    existingChat.participants = updateArrayField(
      existingChat.participants,
      participantsToAlter,
      operation
    );
  }

  existingChat.description =
    existingChat.type === EConversationTypes.GROUP
      ? description || existingChat.description
      : null;
  existingChat.name =
    existingChat.type === EConversationTypes.GROUP
      ? name || existingChat.name
      : null;
  existingChat.image =
    existingChat.type === EConversationTypes.GROUP
      ? image || existingChat.image
      : null;
  existingChat.lastMessage = lastMessage;

  existingChat.type =
    existingChat.type === EConversationTypes.GROUP
      ? existingChat.type
      : type || existingChat.type;

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
