import { NextFunction, Request, Response } from "express";
import NotFoundError from "../exceptions/notFoundError";
import ClientError from "../exceptions/clientError";
import User from "../models/User";
import { generateUserSafeCopy } from "../utils/helpers";
import { IUser } from "../definitions/interfaces";

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params?.id;

  if (id) {
    throw new ClientError(`Invalid id: ${id} provided`);
  }

  const existingUser = await User.findById({ _id: id });

  if (!existingUser) {
    throw new NotFoundError(`User not found with id: ${id}`);
  }
  const safeCopyUser = generateUserSafeCopy(existingUser);

  return res.status(200).json({ data: safeCopyUser });
};

const createUser = (req: Request, res: Response, next: NextFunction) => {
  const { username, password, confirmPassword, profileImage, about } = req.body;
};

const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params;

  if (!username) {
    throw new ClientError(
      `Invalid or incorrect username provided: ${username}`
    );
  }

  const userFound = await User.find({ username: username });

  if (!userFound) {
    throw new NotFoundError(`User not found with username: ${username}`);
  }

  const safeCopyUser = generateUserSafeCopy(userFound);

  return res.status(200).json({ data: safeCopyUser });
};

const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (id) {
    throw new ClientError(`Invalid id: ${id} provided`);
  }

  const deleteResp = await User.deleteOne({ _id: id });

  console.log("deleteResp -> ", deleteResp);

  res.status(204).json();
};

const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, confirmPassword, profileImage, about } = req.body;
  const { id } = req.params;
};

export {
  getUserById,
  createUser,
  deleteUserById,
  updateUserById,
  getUserByUsername,
};
