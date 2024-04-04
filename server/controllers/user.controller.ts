import { NextFunction, Request, Response } from "express";

import ClientError from "../exceptions/clientError";
import {
  createUser,
  deleteUserById,
  getUserById,
  getUserByUsername,
  updateUser,
} from "../state/user";
import {
  generateUserSafeCopy,
  hashPassword,
  validatePassword,
} from "../utils/helpers";
import { EUserRoles } from "../definitions/enums";

/**
 * Get user data by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the middleware chain.
 * @throws {ClientError} Throws a ClientError if an invalid ID is provided.
 * @returns {Promise<Response>} A Promise that resolves with the user data.
 */
const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const id = req.params?.id;

  // Validate ID
  if (!id) {
    throw new ClientError(`Invalid id: ${id} provided`);
  }

  // Retrieve user data by ID
  const userData = await getUserById(id);

  const safeCopyUser = generateUserSafeCopy(userData);

  // Send response with user data
  return res.status(200).json({ data: safeCopyUser });
};

/**
 * Creates a new user based on the provided request data.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Promise<void>} A Promise that resolves once the user is created.
 * @throws {ClientError} Throws a ClientError if the provided passwords do not match, if an invalid role is provided,
 * or if a user already exists with the given username.
 */
const create = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password, profileImage, about, role } = req.body;

  if (role !== EUserRoles.User && role !== EUserRoles.Admin) {
    throw new ClientError(`Invalid role provided role: ${role}`);
  }

  const existingUser = await getUserByUsername(username);

  if (existingUser) {
    throw new ClientError(`User already exists with username: ${username}`);
  }

  const { salt, hashedPassword } = await hashPassword(password);
  const createdUser = await createUser(
    username,
    hashedPassword,
    profileImage,
    about,
    role,
    salt
  );

  const safeCopyUser = generateUserSafeCopy(createdUser);

  res.status(201).json({ data: safeCopyUser });
};

/**
 * Retrieves a user by username from the database.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @throws {ClientError} If an invalid or incorrect username is provided.
 */
const getByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.query;
  console.log(username);

  if (!username) {
    throw new ClientError(
      `Invalid or incorrect username provided: ${username}`
    );
  }

  const userFound = await getUserByUsername(username as string);

  const safeCopyUser = generateUserSafeCopy(userFound);

  return res.status(200).json({ data: safeCopyUser });
};

/**
 * Delete a user by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function in the middleware chain.
 * @throws {ClientError} Throws a ClientError if an invalid ID is provided.
 * @returns {Promise<void>} A Promise that resolves when the user is deleted successfully.
 */
const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    throw new ClientError(`Invalid id: ${id} provided`);
  }

  // Delete user by ID
  const deleteResp = await deleteUserById(id);

  // Send success response
  res.status(200).json({ data: deleteResp });
};

/**
 * Updates a user's information in the database by their ID.
 * @param {Request} req - The request object containing user information.
 * @param {Response} res - The response object for sending responses.
 * @param {NextFunction} next - The next function to call in the middleware chain.
 * @throws {ClientError} Throws a ClientError if the provided user ID is invalid or if the user with the specified ID or username is not found, or if an invalid role is provided.
 * @throws {Error} Throws an error if the update fails for any other reason.
 */
const updateById = async (req: Request, res: Response, next: NextFunction) => {
  const { username, profileImage, about, role } = req.body;
  const { id } = req.params;

  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new ClientError(`User with id: ${id} not found`);
  }

  if (username) {
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      throw new ClientError(`User with username: ${username} already exists`);
    }
  }

  const updatedUser = await updateUser(
    id,
    username,
    profileImage || existingUser.profileImage,
    about || existingUser.about,
    role || existingUser.role,
    existingUser.password,
    existingUser.salt
  );

  const safeCopyUser = generateUserSafeCopy(updatedUser);

  res.status(200).json({ data: safeCopyUser });
};

const updatePasswordById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new ClientError(`User with id: ${id} not found`);
  }

  if (oldPassword === newPassword) {
    throw new ClientError("New password cannot be the same as old password");
  }

  const isPasswordCorrect = await validatePassword(
    existingUser.password,
    oldPassword
  );

  if (!isPasswordCorrect) {
    throw new ClientError("Old password is incorrect");
  }

  const { salt, hashedPassword } = await hashPassword(newPassword);

  const updatedUser = await updateUser(
    id,
    existingUser.username,
    existingUser.profileImage,
    existingUser.about,
    existingUser.role,
    hashedPassword,
    salt
  );

  const safeCopyUser = generateUserSafeCopy(updatedUser);

  res.status(200).json({ data: safeCopyUser });
};

export {
  getById,
  getByUsername,
  create,
  deleteById,
  updateById,
  updatePasswordById,
};
