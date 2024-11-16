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

    let sortingOptions: Record<string, number> = {};
    if (pagination.sortBy && pagination.sortOrder) {
      sortingOptions = {
        [pagination.sortBy]: pagination.sortOrder === "asc" ? -1 : 1,
      };
    }

    return Message.findWithStatus(
      { users: filter.userId, conversation: filter.conversationId },
      pagination.pageNumber,
      pagination.limit,
      sortingOptions
    );
  }
}

export default MessageService;
