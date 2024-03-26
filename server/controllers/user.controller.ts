import { NextFunction, Request, Response } from "express";
import NotFoundError from "../exceptions/notFoundError";
import ClientError from "../exceptions/clientError";
import User from "../models/User";

const getUserById = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params?.id;

  if (id) {
    throw new ClientError(`Invalid id: ${id} provided`);
  }

  const existingUser = User.findById({ _id: id });

  if (!existingUser) {
    throw new NotFoundError(`User not found with id: ${id}`);
  }

  return res.status(200).json(existingUser);
};

const createUser = (req: Request, res: Response, next: NextFunction) => {};

const deleteUserById = (req: Request, res: Response, next: NextFunction) => {};

const updateUserById = (req: Request, res: Response, next: NextFunction) => {};

export { getUserById, createUser, deleteUserById, updateUserById };
