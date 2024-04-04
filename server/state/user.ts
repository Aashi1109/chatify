import { Document } from "mongoose";
import { IUser } from "../definitions/interfaces";
import NotFoundError from "../exceptions/notFoundError";
import User from "../models/User";

/**
 * Retrieves a user by their ID from the database.
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<InstanceType<typeof User> | null>} A Promise that resolves with the retrieved user if there or null.
 */
const getUserById = async (
  id: string
): Promise<InstanceType<typeof User> | null> => {
  const existingUser = (await User.findById(id).lean().exec()) as InstanceType<
    typeof User
  >;

  if (!existingUser) {
    return;
  }

  return existingUser;
};

/**
 * Retrieves a user by their username from the database.
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<InstanceType<typeof User> | null> } A Promise that resolves with the retrieved user if there or null.
 */
const getUserByUsername = async (
  username: string
): Promise<InstanceType<typeof User> | null> => {
  const userFound = (await User.findOne({ username }).lean()) as InstanceType<
    typeof User
  >;

  if (!userFound) {
    return;
  }

  return userFound;
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
  return deleteResp;
};

/**
 * Creates a new user in the database.
 * @param {string} username - The username of the new user.
 * @param {string} hashedPassword - The hashed password of the new user.
 * @param {string} profileImage - The profile image URL of the new user.
 * @param {string} about - The about information of the new user.
 * @param {string} role - The role of the new user.
 * @param {string} salt - The salt used for hashing the password of the new user.
 * @returns {Promise<InstanceType<typeof User>>} A Promise that resolves with the newly created user.
 * @throws {Error} Throws an error if the user creation fails for any reason.
 */
const createUser = async (
  username: string,
  hashedPassword: string,
  profileImage: string,
  about: string,
  role: string,
  salt: string
): Promise<InstanceType<typeof User>> => {
  const newUser = new User({
    username,
    password: hashedPassword,
    profileImage,
    about,
    role,
    salt,
  });
  await newUser.save();
  return newUser.toObject();
};

/**
 * Updates a user in the database with the provided information.
 * @param {string} id - The ID of the user to update.
 * @param {string} username - The updated username of the user.
 * @param {string} profileImage - The updated profile image URL of the user.
 * @param {string} about - The updated about information of the user.
 * @param {string} role - The updated role information of the user.
 * @param {string} password - The updated password information of the user.
 * @param {string} salt - The updated salt information of the user.
 * @returns {Promise<IUser>} A Promise that resolves with the updated user.
 * @throws {Error} Throws an error if the update fails for any other reason.
 */
const updateUser = async (
  id: string,
  username: string,
  profileImage: string,
  about: string,
  role: string,
  password: string,
  salt: string
): Promise<InstanceType<typeof User>> => {
  const updatedUser = (await User.findByIdAndUpdate(
    id,
    { username, profileImage, about, role, password, salt },
    { new: true }
  ).lean()) as InstanceType<typeof User>;
  return updatedUser;
};

export {
  updateUser,
  getUserById,
  getUserByUsername,
  deleteUserById,
  deleteUserByUsername,
  createUser,
};
