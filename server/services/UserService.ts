import NotFoundError from "../exceptions/notFoundError";
import User from "../models/User";

class UserService {
  /**
   * Retrieves a user by their ID from the database.
   * @param {string} id - The ID of the user to retrieve.
   * @returns {Promise<InstanceType<typeof User> | null>} A Promise that resolves with the retrieved user if there or null.
   */
  static async getUserById(id: string) {
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
  static async getUserByUsername(username: string) {
    const userFound = (await User.findOne({ username }).lean()) as InstanceType<
      typeof User
    >;

    return userFound;
  }

  /**
   * Deletes a user by their ID from the database.
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<User>} A Promise that resolves once the user is deleted.
   * @throws {NotFoundError} Throws a NotFoundError if the user with the specified username is not found.
   */
  static async deleteUserById(id: string) {
    const deleteResp = await User.findByIdAndDelete(id);
    return deleteResp;
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
    salt: string
  ) {
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
    lastSeenAt: Date
  ) {
    const updatedUser = (await User.findByIdAndUpdate(
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
      { new: true }
    ).lean()) as InstanceType<typeof User>;
    return updatedUser;
  }

  /**
   * Retrieves all users from the database.
   * @returns {Promise<InstanceType<typeof User>[]>} A Promise that resolves with an array of all users.
   */
  static async getAllUsers(not?: string) {
    return (await User.find({ _id: { $ne: not ?? null } }).lean()) as Array<
      InstanceType<typeof User>
    >;
  }
}

export default UserService;
