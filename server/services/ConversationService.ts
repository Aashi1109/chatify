import { IConversation, IPagination } from "@definitions/interfaces";
import { Conversation } from "@models";
import { getByFilter, updateArrayField } from "@lib/helpers";
import { FlattenMaps, Require_id } from "mongoose";

class ConversationService {
  /**
   * Retrieves chat data from the database based on the provided filter criteria.
   * @param {Object} filter - Filter criteria for querying chats.
   * @param {string} [filter._id] - The ID of the chat to retrieve.
   * @param {string[]} [filter.participants] - The IDs of the participants.
   * @param {object} pagination - The pagination object for query.
   * @param {string} [not] - ID of the document not to include in the chats results.
   * @returns {Promise<Require_id<FlattenMaps<IConversation>>[]>} A Promise that resolves to an array of retrieved chat objects.
   * @throws {Error} If there's an error fetching user chats by the provided filter.
   */
  static async getConversationByFilter(
    filter: {
      _id?: string;
      participants?: string[];
    },
    pagination?: IPagination,
    not?: string
  ): Promise<Require_id<FlattenMaps<IConversation>>[]> {
    if (pagination) pagination.populateFields ??= ["participants", "messages"];
    const _inFields = [...new Set(filter.participants)];
    const filteredFields = _inFields.filter(Boolean);

    const query = filter?._id ? { _id: filter?._id } : {};
    return getByFilter(Conversation)(query, pagination, not, {
      participants: { $in: filteredFields },
    });
  }
}

export default ConversationService;
