import { IPagination, IUserGroups } from "@/definitions/interfaces";
import { getByFilter } from "@lib/helpers";
import { UserGroups } from "@models";

/**
 * Service class for CRUD operations on UserGroups model.
 */
class UserGroupService {
  /**
   * Creates a new user group association.
   * @param {Partial<IUserGroups>} userGroupData - Data for the new user group association.
   * @returns {Promise<IUserGroups>} The created user group association.
   */
  static async createUserGroup(
    userGroupData: IUserGroups
  ): Promise<InstanceType<typeof UserGroups>> {
    try {
      return (await UserGroups.create(userGroupData)).toObject();
    } catch (error) {
      console.error("Error creating user group association:", error);
      throw error;
    }
  }

  /**
   * Retrieves user group associations by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<IUserGroups[]>} The user group associations for the user.
   */
  static async getUserGroupByUserId(userId: string): Promise<IUserGroups[]> {
    try {
      return await UserGroupService.getUserGroupsByFilter({ _id: userId });
    } catch (error) {
      console.error(
        "Error fetching user group associations by user ID:",
        error
      );
      throw error;
    }
  }

  /**
   * Retrieves user group associations by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<IUserGroups[]>} The user group associations for the user.
   */
  static async getUserGroupByGroupId(userId: string): Promise<IUserGroups[]> {
    try {
      return await UserGroupService.getUserGroupsByFilter({ _id: userId });
    } catch (error) {
      console.error(
        "Error fetching user group associations by user ID:",
        error
      );
      throw error;
    }
  }

  /**
   * Deletes a user group association.
   * @param {string} userId - The ID of the user.
   * @param {string} groupId - The ID of the group.
   */
  static async deleteUserGroup(
    userId: string,
    groupId: string
  ): Promise<IUserGroups | null> {
    try {
      return await UserGroups.findOneAndDelete({ userId, groupId });
    } catch (error) {
      console.error("Error deleting user group association:", error);
      throw error;
    }
  }

  static async getUserGroupsByFilter(
    filter: {
      userId?: string;
      groupId?: string;
      _id?: string;
    },
    pagination?: IPagination
  ) {
    try {
      return getByFilter(UserGroups)(filter, pagination);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      throw error;
    }
  }
  static async getAllUserGroups(): Promise<
    Array<InstanceType<typeof UserGroups> | any>
  > {
    try {
      return await UserGroupService.getUserGroupsByFilter({});
    } catch (error) {
      console.error("Error fetching all user groups:", error);
      throw error;
    }
  }
}

export default UserGroupService;
