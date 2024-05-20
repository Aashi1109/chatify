import {IChats} from "@definitions/interfaces";
import ClientError from "@exceptions/clientError";
import ChatsService from "@services/ChatsService";

import {Request, Response} from "express";

/**
 * Creates a new user chat with the provided chatId and userId.
 * @param {Request} req - The request object containing the room information.
 * @param {Response} res - The response object for sending responses.
 * @throws {Error} Throws an error if the name or description is missing.
 */
const createChat = async (req: Request, res: Response) => {
  const { messages, receiverId, userId } = req.body as {
    receiverId: string;
    messages?: string[];
    userId: string;
  };

  if (!userId || !receiverId) {
    throw new ClientError("userId and receiverId are required");
  }

  const newChat = await ChatsService.createChat(userId, receiverId, messages);

  res.status(201).json({ success: true, data: newChat });
};

/**
 * Retrieves a chat by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the chat with the specified ID is not found.
 */
const getChatsById = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  // options to configure query parameters
  let { limit, populate, sortBy, sortOrder } = req.query;

  const userChats = await ChatsService.getChatsByFilter(
    {
      _id: chatId,
    },
    +limit,
    sortBy !== "createdAt" && sortBy !== "updatedAt" ? null : sortBy,
    sortOrder !== "asc" && sortOrder !== "desc" ? null : sortOrder,
    !!populate,
  );

  res.json({ success: true, data: userChats });
};

/**
 * Retrieves a chat by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the chat with the specified ID is not found.
 */
const getChatsByQuery = async (req: Request, res: Response) => {
  // options to configure query parameters
  let {
    limit,
    populate,
    sortBy,
    sortOrder,
    pageNumber,
    chatId,
    userId,
    receiverId,
    not,
  } = req.query;

  const filter: { _id?: string; userId?: string; receiverId?: string } = {};
  if (chatId) {
    filter._id = chatId as string;
  }
  if (userId) {
    filter.userId = userId as string;
  }
  if (receiverId) {
    filter.receiverId = receiverId as string;
  }

  const userChats = await ChatsService.getChatsByFilter(
    filter,
    +limit,
    sortBy !== "createdAt" && sortBy !== "updatedAt" ? null : sortBy,
    sortOrder !== "asc" && sortOrder !== "desc" ? null : sortOrder,
    !!populate,
    +pageNumber,
    null,
    not as string,
  );

  res.json({ success: true, data: userChats });
};

/**
 * Retrieves all chats for given userid from database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object for sending responses.
 */
const getAllUserChats = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const chats = await ChatsService.getChatsByUserId(userId);
  res.json({ success: true, data: chats });
};

/**
 * Retrieves all chats for given userid from database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object for sending responses.
 */
const updateChatById = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { messages, optype } = req.body as {
    messages: IChats["messages"];
    optype: IChats["optype"];
  };

  if (!optype || (optype !== "add" && optype !== "delete")) {
    throw new ClientError("Optype is required or invalid optype provided");
  }

  const chats = await ChatsService.updateChatById(chatId, { messages, optype });
  res.json({ success: true, data: chats });
};

/**
 * Deletes a room by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the room with the specified ID is not found.
 */
const deleteUserChatById = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  // TODO write hooks for deletion of user chats
  const userChatDelete = await ChatsService.deleteChatById(chatId);

  res.status(200).json({
    message: "Chats deleted successfully",
    data: userChatDelete,
    success: true,
  });
};

/**
 * Deletes a room by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the room with the specified ID is not found.
 */
const getByUserAndIteractingUserId = async (req: Request, res: Response) => {
  const { userId, receiverId } = req.params;
  // console.log(userId, receiverId);

  const chatData = await ChatsService.getChatsByFilter({
    userId,
    receiverId,
  });
  res.status(200).json({ data: chatData, success: true });
};

export {
  createChat,
  deleteUserChatById,
  getAllUserChats,
  getByUserAndIteractingUserId,
  getChatsById,
  getChatsByQuery,
  updateChatById,
};
