import {
  ICustomRequest,
  IMessage,
  IRequestPagination,
} from "@definitions/interfaces";
import { Message } from "@models";
import { getByFilter } from "@lib/helpers";

class MessageService {
  /**
   * Get messages by filter.
   * @param filter - Filter object to filter messages
   * @param req - Custom request object
   * @param self - Whether to return messages for current user or not.
   * @returns {Promise<IMessage[] | IMessage>} A promise that resolves with an array of filtered messages.
   */
  static async getMessagesByFilter(
    filter: {
      userId?: string;
      conversation: string;
      _id?: string;
    },
    req: ICustomRequest & IRequestPagination,
    self?: boolean
  ) {
    const { pagination } = req;

    if (pagination) pagination.populateFields ??= ["user", "conversation"];

    const messages: IMessage[] = await getByFilter({
      model: Message,
      filter,
      pagination,
    });

    return messages;
  }
}

export default MessageService;
