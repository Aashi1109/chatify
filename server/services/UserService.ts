import NotFoundError from "@exceptions/notFoundError";
import { User } from "@models";
import { FlattenMaps, Require_id } from "mongoose";
import { IUser } from "@definitions/interfaces";
import { getByFilter } from "@utils/helpers";

class UserService {
  /**
   * Retrieves a user by their ID from the database.
   * @param {string} id - The ID of the user to retrieve.
   * @returns {Promise<InstanceType<typeof User> | null>} A Promise that resolves with the retrieved user if there or null.
   */
  static async getUserById(
    id: string,
  ): Promise<InstanceType<typeof User> | null> {
    const existingUser = (await User.findById(id)
      .lean()
      .exec()) as InstanceType<typeof User>;

    if (!existingUser) {
      return null;
    }

    return existingUser;
  }

  /**
   * Retrieves a user by their username from the database.
   * @param {string} username - The username of the user to retrieve.
   * @returns {Promise<InstanceType<typeof User> | null> } A Promise that resolves with the retrieved user if there or null.
   */
  static async getUserByUsername(
    username: string,
  ): Promise<InstanceType<typeof User> | null> {
    return (await User.findOne({ username }).lean()) as InstanceType<
      typeof User
    >;
  }

  /**
   * Deletes a user by their ID from the database.
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<InstanceType<typeof User>>} A Promise that resolves once the user is deleted.
   * @throws {NotFoundError} Throws a NotFoundError if the user with the specified username is not found.
   */
  static async deleteUserById(id: string): Promise<InstanceType<typeof User>> {
    return User.findByIdAndDelete(id);
  }

  /**
   * Deletes a user by their username from the database.
   * @param {string} username - The username of the user to delete.
   * @returns {Promise<void>} A Promise that resolves once the user is deleted.
   * @throws {NotFoundError} Throws a NotFoundError if the user with the specified username is not found.
   */
  static async deleteUserByUsername(username: string) {
    const deleteResp = await User.deleteOne({ username });

    if (deleteResp.deletedCount === 0) {
      throw new NotFoundError(`User not found with username: ${username}`);
    }
    return deleteResp;
  }

  /**
   * Creates a new user in the database.
   * @param {string} username - The username of the new user.
   * @param {string} name - The name of the new user.
   * @param {string} hashedPassword - The hashed password of the new user.
   * @param {string} profileImage - The profile image URL of the new user.
   * @param {string} about - The about information of the new user.
   * @param {string} role - The role of the new user.
   * @param {string} salt - The salt used for hashing the password of the new user.
   * @returns {Promise<InstanceType<typeof User>>} A Promise that resolves with the newly created user.
   * @throws {Error} Throws an error if the user creation fails for any reason.
   */
  static async createUser(
    username: string,
    name: string,
    hashedPassword: string,
    profileImage: string,
    about: string,
    role: string,
    salt: string,
  ): Promise<InstanceType<typeof User>> {
    const newUser = new User({
      username,
      name,
      password: hashedPassword,
      profileImage,
      about,
      role,
      salt,
    });
    await newUser.save();
    return newUser.toObject() as InstanceType<typeof User>;
  }

  /**
   * Updates a user in the database with the provided information.
   * @param {string} id - The ID of the user to update.
   * @param {string} username - The updated username of the user.
   * @param {string} name - The updated name of the user.
   * @param {object} profileImage - The updated profile image URL of the user.
   * @param {string} about - The updated about information of the user.
   * @param {string} role - The updated role information of the user.
   * @param {string} password - The updated password information of the user.
   * @param {string} salt - The updated salt information of the user.
   * @param {boolean} isActive - The updated online status of the user.
   * @param {Date} lastSeenAt - The updated last seen time of the user.
   * @returns {Promise<InstanceType<typeof User>>} A Promise that resolves with the updated user.
   * @throws {Error} Throws an error if the update fails for any other reason.
   */
  static async updateUser(
    id: string,
    username: string,
    name: string,
    profileImage: object,
    about: string,
    role: string,
    password: string,
    salt: string,
    isActive: boolean,
    lastSeenAt: Date,
  ): Promise<InstanceType<typeof User>> {
    return (await User.findByIdAndUpdate(
      id,
      {
        username,
        name,
        profileImage,
        about,
        role,
        password,
        salt,
        lastSeenAt,
        isActive,
      },
      { new: true },
    ).lean()) as InstanceType<typeof User>;
  }

  /**
   * Retrieves all users from the database.
   * @param {string} not - The id not to include in the results
   * @returns {Promise<InstanceType<typeof User>[]>} A Promise that resolves with an array of all users.
   */
  static async getAllUsers(not?: string): Promise<InstanceType<typeof User>[]> {
    return (await User.find({ _id: { $ne: not ?? null } }).lean()) as Array<
      InstanceType<typeof User>
    >;
  }

  /**
   * Retrieves user data from the database based on the provided filter criteria.
   * @param {Object} filter - Filter criteria for querying chats.
   * @param {string} [filter.username] - The ID of the user whose data to retrieve.
   * @param {string} [filter._id] - The ID of the user to retrieve.
   * @param {number} [limit] - Limit the number of users to retrieve.
   * @param {"createdAt" | "updatedAt"} [sortBy] - Sort users by creation or update time.
   * @param {"asc" | "desc"} [sortOrder] - Sort order for users.
   * @param {boolean} [doPopulate=true] - Flag to specify whether to populate fields. Defaults to true.
   * @param {number} [pageNumber=1] - Current page number to fetch data from
   * @param {string[]} [populateFields] - Fields to populate in the retrieved users.
   * @param {string} [not] - Document not to include in the result of users.
   * @returns {Promise<Require_id<FlattenMaps<IUser>>[]>} A Promise that resolves to an array of retrieved user objects.
   * @throws {Error} If there's an error fetching users by the provided filter.
   */
  static async getUsersByFilter(
    filter: {
      username?: string;
      _id?: string;
    },
    limit?: number,
    sortBy?: "createdAt" | "updatedAt",
    sortOrder?: "asc" | "desc",
    doPopulate: boolean = true,
    pageNumber: number = 1,
    populateFields?: string[],
    not?: string,
  ): Promise<Require_id<FlattenMaps<IUser>>[]> {
    populateFields ??= ["profileImage.fileDataId"];
    return getByFilter(User)(
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

export default UserService;
