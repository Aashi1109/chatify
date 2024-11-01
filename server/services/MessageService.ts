import { IMessage, IPagination } from "@definitions/interfaces";
import { Message } from "@models";
import { getByFilter } from "@lib/helpers";

class MessageService {
  /**
   * Get messages by filter.
   * @param filter - Filter object to filter messages
   * @param pagination - Whether to return first match only. Default is false which returns all messages.
   * @returns {Promise<IMessage[] | IMessage>} A promise that resolves with an array of filtered messages.
   */
  static async getMessagesByFilter(
    filter: {
      userId?: string;
      conversationId?: string;
      _id?: string;
    },
    pagination?: IPagination,
    not?: string
  ) {
    if (pagination) pagination.populateFields ??= ["user", "conversation"];
    return getByFilter(Message)(filter, pagination, not);
  }
}

export default MessageService;
