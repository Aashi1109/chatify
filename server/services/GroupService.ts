import {IGroups} from "@/definitions/interfaces";
import {Groups} from "@models";
import {getByFilter} from "@lib/helpers";
import {FlattenMaps, Require_id} from "mongoose";

/**
 * Service class for CRUD operations on Groups model.
 */
class GroupService {
  /**
   * Creates a new group.
   * @param {Partial<IGroups>} groupData - Data for the new group.
   * @returns {Promise<IGroups>} The created group.
   */
  static async createGroup(
    groupData: IGroups,
  ): Promise<InstanceType<typeof Groups>> {
    try {
      return (await Groups.create(groupData)).toJSON();
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  }

  /**
   * Retrieves a group by its ID.
   * @param {string} groupId - The ID of the group to retrieve.
   * @returns {Promise<IGroups | null>} The retrieved group, or null if not found.
   */
  static async getGroupById(
    groupId: string,
  ): Promise<InstanceType<typeof Groups> | null> {
    try {
      return await Groups.findById(groupId).lean();
    } catch (error) {
      console.error("Error fetching group by ID:", error);
      throw error;
    }
  }

  /**
   * Updates a group.
   * @param {string} groupId - The ID of the group to update.
   * @param {Partial<IGroups>} update - Updated data for the group.
   * @returns {Promise<IGroups | null>} The updated group.
   */
  static async updateGroup(
    groupId: string,
    update: Partial<IGroups>,
  ): Promise<IGroups | null> {
    try {
      return await Groups.findByIdAndUpdate(groupId, update, {
        new: true,
      }).lean();
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  }

  /**
   * Deletes a group.
   * @param {string} groupId - The ID of the group to delete.
   */
  static async deleteGroup(groupId: string): Promise<void> {
    try {
      await Groups.findByIdAndDelete(groupId).exec();
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  }

  /**
   * Retrieves groups based on the specified filter criteria.
   *
   * @param {Object} filter - The filter criteria for retrieving groups.
   * @param {string} [filter.creatorId] - The ID of the creator to filter groups by.
   * @param {string} [filter._id] - The ID of the group to filter by.
   * @param {number} [limit] - The maximum number of groups to retrieve.
   * @param {"createdAt" | "updatedAt"} [sortBy] - The field to sort the results by.
   * @param {"asc" | "desc"} [sortOrder] - The order to sort the results in.
   * @param {boolean} [doPopulate=true] - Whether to populate specified fields.
   * @param {string[]} [populateFields] - The fields to populate in the results.
   * @param {number} [pageNumber] - The page number for pagination.
   * @param {string} [not] - A field value to exclude from the results.
   * @returns {Promise<Require_id<FlattenMaps<IChats>>[]>} A promise that resolves to an array of groups matching the filter criteria.
   */
  static async getGroupsByFilter(
    filter: {
      creatorId?: string;
      _id?: string;
    },
    limit?: number,
    sortBy?: "createdAt" | "updatedAt",
    sortOrder?: "asc" | "desc",
    doPopulate: boolean = true,
    populateFields?: string[],
    pageNumber?: number,
    not?: string,
  ): Promise<Require_id<FlattenMaps<IGroups>>[]> {
    populateFields ??= ["messages", "creatorId"];
    pageNumber ??= 1;

    return getByFilter(Groups)(
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
}

export default GroupService;
