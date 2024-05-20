import { IMessage } from "@definitions/interfaces";
import { Message } from "@models";
import { getByFilter } from "@utils/helpers";

class MessageService {
  /**
   * Create a new message.
   * @param {object} messageData - The data for the new message.
   * @returns {Promise<InstanceType <typeof Message>>} A promise that resolves with the newly created message object.
   */
  static async create(messageData: IMessage) {
    try {
      const newMessage = new Message(messageData);
      return (await newMessage.save()).toObject();
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  /**
   * Get a message by its ID.
   * @param {string} messageId - The ID of the message to retrieve.
   * @returns {Promise<Message|null>} A promise that resolves with the message object if found, or null if not found.
   */
  static async getById(messageId: string) {
    try {
      return (await MessageService.getMessagesByFilter({
        _id: messageId,
      })) as Array<InstanceType<typeof Message>>;
    } catch (error) {
      console.error("Error fetching message by ID:", error);
      throw error;
    }
  }

  /**
   * Get messages by chat ID.
   * @param {string} chatId - The ID of the chat to retrieve messages for.
   * @returns {Promise<Message[]>} A promise that resolves with an array of messages belonging to the chat.
   */
  static async getByChatId(chatId: string) {
    try {
      return await MessageService.getMessagesByFilter({ chatId });
    } catch (error) {
      console.error("Error fetching messages by chat ID:", error);
      throw error;
    }
  }

  /**
   * Get messages by user ID.
   * @param {string} userId - The ID of the user to retrieve messages for.
   * @returns {Promise<Message[]>} A promise that resolves with an array of messages belonging to the chat.
   */
  static async getByUserId(userId: string) {
    try {
      return await MessageService.getMessagesByFilter({ userId });
    } catch (error) {
      console.error("Error fetching messages by user ID:", error);
      throw error;
    }
  }

  /**
   * Get messages by group ID.
   * @param {string} groupId - The ID of the group to retrieve messages for.
   * @returns {Promise<Message[]>} A promise that resolves with an array of messages belonging to the group.
   */
  static async getByGroupId(groupId: string) {
    try {
      return await MessageService.getMessagesByFilter({ groupId });
    } catch (error) {
      console.error("Error fetching messages by group ID:", error);
      throw error;
    }
  }

  /**
   * Get all messages.
   * @returns {Promise<Message[]>} A promise that resolves with an array of all messages.
   */
  static async getAll() {
    try {
      const messages = await MessageService.getMessagesByFilter({});
      return messages;
    } catch (error) {
      console.error("Error fetching all messages:", error);
      throw error;
    }
  }

  /**
   * Get messages by filter.
   * @param filter Filter objec to filter messages
   * @param singleRow Whether to return first match only. Default is false which returns all messages.
   * @returns {Promise<Message[] | Message>} A promise that resolves with an array of filtered messages.
   */
  static async getMessagesByFilter(
    filter: {
      userId?: string;
      chatId?: string;
      groupId?: string;
      _id?: string;
    },
    limit?: number,
    sortBy?: "createdAt" | "updatedAt",
    sortOrder?: "asc" | "desc",
    doPopulate = true,
    pageNumber?: number,
    populateFields?: string[],
    not?: string,
  ) {
    pageNumber ??= 1;
    populateFields ??= ["userId", "chatId", "groupId"];
    return getByFilter(Message)(
      filter,
      populateFields,
      limit,
      sortBy,
      sortOrder,
      doPopulate,
      pageNumber,
      not,
    );
  }

  /**
   * Updates a message by its ID in the database.
   * @param {string} messageId - The ID of the message to update.
   * @param {string} content - The updated content of the message.
   * @param {Date} deliveredAt - The updated delivered timestamp of the message.
   * @param {Date} seenAt - The updated seen timestamp of the message.
   * @returns {Promise<InstanceType<typeof Message> | null>} A Promise that resolves with the updated message if found, or null if not found.
   * @throws {Error} Throws an error if the update fails for any reason.
   */
  static async updateById(
    messageId: string,
    content: string,
    deliveredAt: Date,
    seenAt: Date,
  ) {
    try {
      return (await Message.findByIdAndUpdate(
        messageId,
        { content, deliveredAt, seenAt },
        {
          new: true,
        },
      ).lean()) as InstanceType<typeof Message>;
    } catch (error) {
      console.error("Error updating message by ID:", error);
      throw error;
    }
  }

  /**
   * Delete a message by its ID.
   * @param {string} messageId - The ID of the message to delete.
   * @returns {Promise<void>} A promise that resolves once the message is deleted.
   */
  static async deleteById(messageId: string) {
    try {
      return (await Message.findByIdAndDelete(
        messageId,
      ).lean()) as InstanceType<typeof Message>;
    } catch (error) {
      console.error("Error deleting message by ID:", error);
      throw error;
    }
  }
}

export default MessageService;
