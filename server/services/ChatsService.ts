import { IChats } from "@definitions/interfaces";
import { Chats } from "@models";
import { getByFilter } from "@utils/helpers";

class ChatsService {
  /**
   * Retrieves user chats by user ID from the database.
   * @param {string} userId - The ID of the user to retrieve chats for.
   * @returns {Promise<InstanceType <typeof UserChats>>} A Promise that resolves with an array of user chats.
   */
  static async getChatsByUserId(userId: string) {
    try {
      return await ChatsService.getChatsByFilter({ userId });
    } catch (error) {
      console.error("Error fetching user chats by user ID:", error);
      throw error;
    }
  }

  /**
   * Retrieves user chats by user ID from the database.
   * @param {string} receiverId - The ID of the user with whom intercation is going on.
   * @returns {Promise<InstanceType <typeof UserChats>>} A Promise that resolves with an array of user chats.
   */
  static async getChatsByReceiverId(receiverId: string) {
    try {
      return await ChatsService.getChatsByFilter({ receiverId });
    } catch (error) {
      console.error("Error fetching user chats by user ID:", error);
      throw error;
    }
  }

  /**
   * Retrieves user chats by user ID from the database.
   * @param {string} chatId - The ID of the chat to retrieve.
   * @returns {Promise<any[]>} A Promise that resolves with an array of user chats.
   */
  static async getChatsByChatId(chatId: string) {
    try {
      return await ChatsService.getChatsByFilter({ _id: chatId });
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
   * @param {number} [limit] - Limit the number of chats to retrieve.
   * @param {"createdAt" | "updatedAt"} [sortBy] - Sort chats by creation or update time.
   * @param {"asc" | "desc"} [sortOrder] - Sort order for chats.
   * @param {boolean} [doPopulate=true] - Flag to specify whether to populate fields. Defaults to true.
   * @param {string[]} [populateFields] - Fields to populate in the retrieved chats.
   * @returns {Promise<Object[]>} A Promise that resolves to an array of retrieved chat objects.
   * @throws {Error} If there's an error fetching user chats by the provided filter.
   */
  static async getChatsByFilter(
    filter: {
      userId?: string;
      _id?: string;
      receiverId?: string;
    },
    limit?: number,
    sortBy?: "createdAt" | "updatedAt",
    sortOrder?: "asc" | "desc",
    doPopulate = true,
    pageNumber = 1,
    populateFields?: string[]
  ) {
    populateFields ??= ["userId", "receiverId", "messages"];
    return getByFilter(Chats)(
      filter,
      populateFields,
      limit,
      sortBy,
      sortOrder,
      doPopulate,
      pageNumber
    );
  }

  /**
   * Creates a new user chat in the database.
   * @param {string} userId - The user id for which to create.
   * @param {string} chatId - The chat id where messages will be stored.
   * @returns {Promise<any>} A Promise that resolves with the newly created user chat.
   */
  static async createChat(
    userId: string,
    receiverId: string,
    messages?: string[]
  ) {
    try {
      const newUserChat = new Chats({
        userId,
        receiverId,
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
        }
        {
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
