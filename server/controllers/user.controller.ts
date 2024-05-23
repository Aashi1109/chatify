import {Request, Response} from "express";

import {EUserRoles} from "@definitions/enums";
import ClientError from "@exceptions/clientError";
import UserService from "@services/UserService";
import {generateUserSafeCopy, hashPassword, validateJwtTokenId, validatePassword,} from "@utils/helpers";
import {NotFoundError} from "@exceptions";
import {ICustomRequest} from "@definitions/interfaces";

/**
 * Get user data by ID.
 * @param {ICustomRequest} req - The modified request object.
 * @param {Response} res - The response object.
 * @throws {ClientError} Throws a ClientError if an invalid ID is provided.
 * @returns {Promise<Response>} A Promise that resolves with the user data.
 */
const getUserById = async (
  req: ICustomRequest,
  res: Response,
): Promise<Response> => {
  const id = req.params?.id;

  // validate if id and token being used is for the same user
  validateJwtTokenId(req, id);

  // Retrieve user data by ID
  const userData = await UserService.getUserById(id);

  if (!userData) {
    throw new NotFoundError(`User with id: ${id} not found`);
  }

  const safeCopyUser = generateUserSafeCopy(userData);

  // Send response with user data
  return res.status(200).json({ data: safeCopyUser, success: true });
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

  return res.status(201).json({ data: safeCopyUser, success: true });
};

/**
 * Retrieves a user by username from the database.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @throws {ClientError} If an invalid or incorrect username is provided.
 */
const getUserByQuery = async (req: Request, res: Response) => {
  const {
    username,
    userId,
    not,
    limit,
    populate,
    sortBy,
    sortOrder,
    pageNumber,
  } = req.query;
  // console.log("doPopulate -> ", !!populate);

  const filter: { _id?: string; username?: string } = {};
  if (username) {
    filter.username = username as string;
  }
  if (userId) {
    filter._id = userId as string;
  }

  const users = await UserService.getUsersByFilter(
    filter,
    +limit,
    sortBy !== "createdAt" && sortBy !== "updatedAt" ? null : sortBy,
    sortOrder !== "asc" && sortOrder !== "desc" ? null : sortOrder,
    !!populate,
    +pageNumber,
    null,
    not as string,
  );

  const safeCopyUsers = users.map((user) => generateUserSafeCopy(user));

  return res.json({ success: true, data: safeCopyUsers });
};

/**
 * Delete a user by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @throws {ClientError} Throws a ClientError if an invalid ID is provided.
 * @returns {Promise<Response>} A Promise that resolves when the user is deleted successfully.
 */
const deleteUserById = async (
  req: ICustomRequest,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  // validate if id and token being used is for the same user
  validateJwtTokenId(req, id);

  // Delete user by ID
  const deleteResp = await UserService.deleteUserById(id);

  // Send success response
  return res.status(200).json({
    data: deleteResp
      ? generateUserSafeCopy(deleteResp?.toObject())
      : deleteResp,
    success: true,
  });
};

/**
 * Updates a user's information in the database by their ID.
 * @param {ICustomRequest} req - The custom request object containing user information.
 * @param {Response} res - The response object for sending responses.
 * @throws {ClientError} Throws a ClientError if the provided user ID is invalid or if the user with the specified ID or username is not found, or if an invalid role is provided.
 * @throws {Error} Throws an error if the update fails for any other reason.
 */
const updateUserById = async (req: ICustomRequest, res: Response) => {
  const { username, name, profileImage, about, role, lastSeenAt, isActive } =
    req.body;
  const { id } = req.params;

  // validate if id and token being used is for the same user
  validateJwtTokenId(req, id);

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

  return res.status(200).json({ data: safeCopyUser, success: true });
};

/**
 * Updates user's password
 * @param {ICustomRequest} req - Request object
 * @param {Response} res - Response object
 * @throws {ClientError} Throws a ClientError if previous password is incorrect
 * @throws {NotFoundError} Throws a NotFoundError if user doesn't exist
 * @return {Promise<Response>} Promise resolved with the updated user
 */
const updateUserPasswordById = async (
  req: ICustomRequest,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  // validate if id and token being used is for the same user
  validateJwtTokenId(req, id);

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

  return res.status(200).json({ data: safeCopyUser, success: true });
};

/**
 * Get all the users present in the database
 * @param {Request} _ - Request object
 * @param {Response} res - Response object
 * @returns {Promise<Response>} Promise resolved with all the users
 */
const getAllUsers = async (_: Request, res: Response): Promise<Response> => {
  const data = await UserService.getAllUsers();
  const safeCopyUsers = data.map((user) => generateUserSafeCopy(user));
  return res.status(200).json({ data: safeCopyUsers, success: true });
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
