import {NextFunction, Request, Response} from "express";

import {EUserRoles} from "@definitions/enums";
import ClientError from "@exceptions/clientError";
import UserService from "@services/UserService";
import {generateUserSafeCopy, hashPassword, validatePassword,} from "@utils/helpers";
import {IUser} from "@definitions/interfaces";
import {Document, Types} from "mongoose";
import {NotFoundError} from "@exceptions";

/**
 * Get user data by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @throws {ClientError} Throws a ClientError if an invalid ID is provided.
 * @returns {Promise<Response>} A Promise that resolves with the user data.
 */
const getUserById = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params?.id;

  // Validate ID
  if (!id) {
    throw new ClientError(`Invalid id: ${id} provided`);
  }

  // Retrieve user data by ID
  const userData = await UserService.getUserById(id);

  if (!userData) {
    throw new NotFoundError(`User with id: ${id} not found`);
  }

  const safeCopyUser = generateUserSafeCopy(userData);

  // Send response with user data
  return res.status(200).json({ data: safeCopyUser });
};

/**
 * Creates a new user based on the provided request data.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response>} A Promise that resolves with created user once the user is created.
 * @throws {ClientError} Throws a ClientError if the provided passwords do not match, if an invalid role is provided,
 * or if a user already exists with the given username.
 */
const createUser = async (req: Request, res: Response): Promise<Response> => {
  const { username, name, password, profileImage, about, role } = req.body;

  if (role !== EUserRoles.User && role !== EUserRoles.Admin) {
    throw new ClientError(`Invalid role provided role: ${role}`);
  }

  const existingUser = await UserService.getUserByUsername(username);

  if (existingUser) {
    throw new ClientError(`User already exists with username: ${username}`);
  }

  const { salt, hashedPassword } = await hashPassword(password);
  const createdUser = await UserService.createUser(
    username,
    name,
    hashedPassword,
    profileImage,
    about,
    role,
    salt,
  );

  const safeCopyUser = generateUserSafeCopy(createdUser);

  return res.status(201).json({ data: safeCopyUser });
};

/**
 * Retrieves a user by username from the database.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @throws {ClientError} If an invalid or incorrect username is provided.
 */
const getUserByQuery = async (req: Request, res: Response) => {
  const { username, userId, not } = req.query;

  if (!username && !userId) {
    const data = await UserService.getAllUsers(not as string);

    const safeCopyUsers = data.map((user) => generateUserSafeCopy(user));

    return res.status(200).json({ data: safeCopyUsers });
  } else {
    let data: Document<unknown, {}, IUser> & IUser & { _id: Types.ObjectId };
    if (!!username) {
      data = await UserService.getUserByUsername(username as string);
    } else if (!!userId) {
      data = await UserService.getUserById(userId as string);
    }

    const safeCopyUser = generateUserSafeCopy(data);
    return res.status(200).json({ data: safeCopyUser });
  }
};

/**
 * Delete a user by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @throws {ClientError} Throws a ClientError if an invalid ID is provided.
 * @returns {Promise<Response>} A Promise that resolves when the user is deleted successfully.
 */
const deleteUserById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    throw new ClientError(`Invalid id: ${id} provided`);
  }

  // Delete user by ID
  const deleteResp = await UserService.deleteUserById(id);

  // Send success response
  return res.status(200).json({ data: deleteResp });
};

/**
 * Updates a user's information in the database by their ID.
 * @param {Request} req - The request object containing user information.
 * @param {Response} res - The response object for sending responses.
 * @param {NextFunction} next - The next function to call in the middleware chain.
 * @throws {ClientError} Throws a ClientError if the provided user ID is invalid or if the user with the specified ID or username is not found, or if an invalid role is provided.
 * @throws {Error} Throws an error if the update fails for any other reason.
 */
const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, name, profileImage, about, role, lastSeenAt, isActive } =
    req.body;
  const { id } = req.params;

  const existingUser = await UserService.getUserById(id);
  if (!existingUser) {
    throw new NotFoundError(`User with id: ${id} not found`);
  }

  if (username && username !== existingUser.username) {
    const existingUsername = await UserService.getUserByUsername(username);
    if (existingUsername) {
      throw new ClientError(`User with username: ${username} already exists`);
    }
  }

  const updatedUser = await UserService.updateUser(
    id,
    username,
    name || existingUser.name,
    profileImage || existingUser.profileImage,
    about || existingUser.about,
    role || existingUser.role,
    existingUser.password,
    existingUser.salt,
    isActive ?? existingUser.isActive,
    lastSeenAt ?? existingUser.lastSeenAt,
  );

  const safeCopyUser = generateUserSafeCopy(updatedUser);

  res.status(200).json({ data: safeCopyUser });
};

/**
 * Updates user's password
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @throws {ClientError} Throws a ClientError if previous password is incorrect
 * @throws {NotFoundError} Throws a NotFoundError if user doesn't exist
 * @return {Promise<Response>} Promise resolved with the updated user
 */
const updateUserPasswordById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  const existingUser = await UserService.getUserById(id);
  if (!existingUser) {
    throw new NotFoundError(`User with id: ${id} not found`);
  }

  const isPasswordCorrect = await validatePassword(
    existingUser.password,
    oldPassword,
  );

  if (!isPasswordCorrect) {
    throw new ClientError("Old password is incorrect");
  }

  const { salt, hashedPassword } = await hashPassword(newPassword);

  const updatedUser = await UserService.updateUser(
    id,
    existingUser.username,
    existingUser.name,
    existingUser.profileImage,
    existingUser.about,
    existingUser.role,
    hashedPassword,
    salt,
    existingUser.isActive,
    existingUser.lastSeenAt,
  );

  const safeCopyUser = generateUserSafeCopy(updatedUser);

  return res.status(200).json({ data: safeCopyUser });
};

/**
 * Get all the users present in the database
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns {Promise<Response>} Promise resolved with all the users
 */
const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  const data = await UserService.getAllUsers();
  const safeCopyUsers = data.map((user) => generateUserSafeCopy(user));
  return res.status(200).json({ data: safeCopyUsers });
};

export {
  createUser,
  getAllUsers,
  deleteUserById,
  getUserById,
  getUserByQuery,
  updateUserById,
  updateUserPasswordById,
};
