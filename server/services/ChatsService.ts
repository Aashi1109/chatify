import { IChats, IPagination } from "@definitions/interfaces";
import { Chats } from "@models";
import { getByFilter } from "@lib/helpers";
import { FlattenMaps, Require_id } from "mongoose";

class ChatsService {
  /**
   * Retrieves user chats by user ID from the database.
   * @param {string} userId - The ID of the user to retrieve chats for.
   * @returns {Promise<Require_id<FlattenMaps<IChats>>[]>} A Promise that resolves with an array of user chats.
   */
  static async getChatsForUser(
    userId: string
  ): Promise<Require_id<FlattenMaps<IChats>>[]> {
    try {
      return await ChatsService.getChatsByFilter(
        {
          userId,
          receiverId: userId,
        },
        null
      );
    } catch (error) {
      console.error("Error fetching user chats by user ID:", error);
      throw error;
    }
  }

  /**
   * Retrieves chat data from the database based on the provided filter criteria.
   * @param {Object} filter - Filter criteria for querying chats.
   * @param {string} [filter.userId] - The ID of the user whose chats to retrieve.
   * @param {string} [filter._id] - The ID of the chat to retrieve.
   * @param {string} [filter.receiverId] - The ID of the chat receiver.
   * @param {object} pagination - The pagination object for query.
   * @param {string} [not] - ID of the document not to include in the chats results.
   * @returns {Promise<Require_id<FlattenMaps<IChats>>[]>} A Promise that resolves to an array of retrieved chat objects.
   * @throws {Error} If there's an error fetching user chats by the provided filter.
   */
  static async getChatsByFilter(
    filter: {
      userId?: string;
      _id?: string;
      receiverId?: string;
    },
    pagination?: IPagination,
    not?: string
  ): Promise<Require_id<FlattenMaps<IChats>>[]> {
    if (pagination) pagination.populateFields ??= ["participants", "messages"];
    const _inFields = [...new Set([filter.userId, filter.receiverId])];
    const filteredFields = _inFields.filter(Boolean);
    return getByFilter(Chats)({ _id: filter?._id }, pagination, not, {
      participants: { $in: filteredFields },
    });
  }

  /**
   * Creates a new user chat in the database.
   * @param {string} userId - The user id for which to create.
   * @param receiverId - Id of the receiver
   * @param messages - List of messages
   * @returns {Promise<any>} A Promise that resolves with the newly created user chat.
   */
  static async createChat(
    userId: string,
    receiverId: string,
    messages?: string[]
  ) {
    try {
      const newUserChat = new Chats({
        participants: [userId, receiverId],
        messages: messages ?? [],
      });
      await newUserChat.save();
      return newUserChat.toObject();
    } catch (error) {
      console.error("Error creating user chat:", error);
      throw error;
    }
  }

  /**
   * Updates a user chat in the database.
   * @param {string} chatId - The ID of the user chat to update.
   * @param {object} updateData - The data to update the user chat with.
   * @returns {Promise<any>} A Promise that resolves with the updated user chat.
   */
  static async updateChatById(
    chatId: string,
    updateData: { messages: IChats["messages"]; optype: IChats["optype"] }
  ) {
    try {
      const existingChat = await Chats.findOne({ _id: chatId });
      const { messages, optype } = updateData;
      if (existingChat && messages.length) {
        if (optype === "add") {
          existingChat.messages.push(...messages);
        } else if (optype === "delete") {
          existingChat.messages = existingChat.messages.filter(
            (msg) => !messages.includes(msg)
          );
        }
        await existingChat.save();
      }
      return existingChat?.toJSON();
    } catch (error) {
      console.error("Error updating user chat:", error);
      throw error;
    }
  }

  /**
   * Deletes a user chat by its ID from the database.
   * @param {string} userChatId - The ID of the user chat to delete.
   * @returns {Promise<void>} A Promise that resolves once the user chat is deleted.
   */
  static async deleteChatById(userChatId: string) {
    try {
      return await Chats.findByIdAndDelete(userChatId);
    } catch (error) {
      console.error("Error deleting user chat by ID:", error);
      throw error;
    }
  }
}

export default ChatsService;
