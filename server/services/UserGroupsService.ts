import { IGroups } from "@/definitions/interfaces";
import Groups from "@/models/Groups";

/**
 * Service class for CRUD operations on Groups model.
 */
class GroupService {
  /**
   * Creates a new group.
   * @param {Partial<IGroups>} groupData - Data for the new group.
   * @returns {Promise<IGroups>} The created group.
   */
  static async createGroup(groupData: Partial<IGroups>): Promise<IGroups> {
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
  static async getGroupById(groupId: string): Promise<IGroups | null> {
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
    update: Partial<IGroups>
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
}

export default GroupService;
