import {
  EConversationTypes,
  EMessageCategory,
  EMessageType,
} from "@definitions/enums";
import {
  IConversation,
  ICustomRequest,
  IRequestPagination,
} from "@definitions/interfaces";
import { NotFoundError } from "@exceptions";
import ClientError from "@exceptions/clientError";
import { createFilterFromParams, updateArrayField } from "@lib/helpers";
import { Conversation, Message } from "@models";
import { RedisCommonCache } from "@redis";
import ConversationService from "@services/ConversationService";

import { Request, Response } from "express";

const commonCache = new RedisCommonCache();

/**
 * Creates a new conversation with the provided chatId and userId.
 * @param {Request} req - The request object containing the room information.
 * @param {Response} res - The response object for sending responses.
 * @throws {Error} Throws an error if the name or description is missing.
 */
export const createConversation = async (
  req: ICustomRequest,
  res: Response
) => {
  const { participants, type } = req.body as IConversation;

  const isGroup = type === EConversationTypes.GROUP;

  if (!isGroup) {
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

  // if is group add system messages
  if (isGroup) {
    const populatedChat: any = await newChat.populate("creator participants");
    // const hasCurrentUserCreatedGroup =
    //   populatedChat.creator?._id?.toString() === req.user._id?.toString();
    const participants = populatedChat?.participants?.reduce(
      (acc: string[], participant: any) => {
        if (participant._id.toString() !== req.user._id?.toString()) {
          acc.push(participant.username);
        }
        return acc;
      },
      []
    );
    const systemMessages = [
      `Group created on ${new Date().toLocaleString()}`,
      `${populatedChat.creator?.username} has created the group ${populatedChat.name}`,
      `${participants.join(", ")} have been added to the group`,
    ];

    const messages = systemMessages.map((message) => ({
      conversation: newChat._id,
      user: populatedChat.creator._id,
      content: message,
      type: EMessageType.Text,
      category: EMessageCategory.System,
    }));

    await Message.insertMany(messages);
  }

  await commonCache.methods.setString(
    `conversation:${newChat._id}`,
    newChat.toObject(),
    3600
  );

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

  let userChat = await commonCache.methods.getKey(
    `conversation:${conversationId}`
  );

  if (!userChat) {
    userChat = await Conversation.findById(conversationId);
    userChat &&
      commonCache.methods.setString(
        `conversation:${conversationId}`,
        userChat.toObject(),
        3600
      );
  }

  if (!userChat) throw new NotFoundError("Conversation not found");

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

  // if participants are populated then add their current status from redis
  const isParticipantsPopulated = req.pagination.doPopulate;

  const promises = [commonCache.methods.hGet(`conversation-updates`)];

  if (isParticipantsPopulated) {
    promises.push(commonCache.methods.hGet("user-updates"));
  }

  const [conversationUpdates, userStatuses] = await Promise.all(promises);

  userChats.map((con) => ({
    ...con,
    participants: con.participants.map((par) =>
      typeof par === "object"
        ? { ...par, ...(userStatuses[par._id?.toString()] || {}) }
        : par
    ),
    lastMessage:
      conversationUpdates?.[con._id?.toString()]?.lastMessage ||
      con.lastMessage,
  }));

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

  await Promise.allSettled([
    existingChat.save(),
    commonCache.methods.setString(
      `conversation:${conversationId}`,
      existingChat.toObject(),
      3600
    ),
  ]);

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

  await Promise.allSettled([
    userChatDelete,
    messagesDelete,
    commonCache.methods.deleteKey(`conversation:${conversationId}`),
  ]);

  res.status(200).json({
    message: "Chats deleted successfully",
    data: { userChatDelete, messagesDelete },
    success: true,
  });
};
