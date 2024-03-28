import { IUser } from "../definitions/interfaces";
import NotFoundError from "../exceptions/notFoundError";
import User from "../models/User";
import { generateUserSafeCopy } from "../utils/helpers";

/**
 * Retrieves a user by their ID from the database.
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<IUser | null>} A Promise that resolves with the retrieved user.
 */
const getUserById = async (id: string): Promise<IUser | null> => {
  const existingUser = await User.findById(id);

  if (!existingUser) {
    return;
  }

  const safeCopyUser = generateUserSafeCopy(existingUser);
  return safeCopyUser;
};

/**
 * Retrieves a user by their username from the database.
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<IUser|null>} A Promise that resolves with the retrieved user.
 */
const getUserByUsername = async (username: string): Promise<IUser | null> => {
  const userFound = await User.find({ username: username });

  if (!userFound) {
    return;
  }

  const safeCopyUser = generateUserSafeCopy(userFound);
  return safeCopyUser;
};

/**
 * Deletes a user by their ID from the database.
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<void>} A Promise that resolves once the user is deleted.
 * @throws {NotFoundError} Throws a NotFoundError if the user with the specified username is not found.
 */
const deleteUserById = async (id: string): Promise<void> => {
  const deleteResp = await User.deleteOne({ _id: id });

  if (deleteResp.deletedCount === 0) {
    throw new NotFoundError(`User not found with id: ${id}`);
  }

  return;
};

/**
 * Deletes a user by their username from the database.
 * @param {string} username - The username of the user to delete.
 * @returns {Promise<void>} A Promise that resolves once the user is deleted.
 * @throws {NotFoundError} Throws a NotFoundError if the user with the specified username is not found.
 */
const deleteUserByUsername = async (username) => {
  const deleteResp = await User.deleteOne({ username });

  if (deleteResp.deletedCount === 0) {
    throw new NotFoundError(`User not found with username: ${username}`);
  }
  return;
};

/**
 * Creates a new user in the database.
 * @param {string} username - The username of the new user.
 * @param {string} hashedPassword - The hashed password of the new user.
 * @param {string} profileImage - The profile image URL of the new user.
 * @param {string} about - The about information of the new user.
 * @param {string} role - The role of the new user.
 * @param {string} salt - The salt used for hashing the password of the new user.
 * @returns {Promise<IUser>} A Promise that resolves with the newly created user.
 * @throws {Error} Throws an error if the user creation fails for any reason.
 */
const createUser = async (
  username: string,
  hashedPassword: string,
  profileImage: string,
  about: string,
  role: string,
  salt: string
) => {
  const newUser = new User({
    username,
    password: hashedPassword,
    profileImage,
    about,
    role,
    salt,
  });
  await newUser.save();
  const safeCopyUser = generateUserSafeCopy(newUser);
  return safeCopyUser;
};

/**
 * Updates a user in the database with the provided information.
 * @param {string} id - The ID of the user to update.
 * @param {string} username - The updated username of the user.
 * @param {string} profileImage - The updated profile image URL of the user.
 * @param {string} about - The updated about information of the user.
 * @param {string} role - The updated role information of the user.
 * @returns {Promise<IUser>} A Promise that resolves with the updated user.
 * @throws {Error} Throws an error if the update fails for any other reason.
 */
const updateUser = async (
  id: string,
  username: string,
  profileImage: string,
  about: string,
  role: string
) => {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { username, profileImage, about, role },
    { new: true }
  );
  const safeCopyUser = generateUserSafeCopy(updatedUser);
  return safeCopyUser;
};

export {
  updateUser,
  getUserById,
  getUserByUsername,
  deleteUserById,
  deleteUserByUsername,
  createUser,
};
