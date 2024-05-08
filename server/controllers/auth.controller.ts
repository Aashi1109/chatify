import { NextFunction, Request, Response } from "express";

import ClientError from "../exceptions/clientError";
import UnauthorizdError from "../exceptions/unauthorizedError";
import UserService from "../services/UserService";
import { generateAccessToken, validatePassword } from "../utils/helpers";

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    throw new ClientError("Username and password are required");
  }

  const existingUser = await UserService.getUserByUsername(username);

  const isPasswordValid = await validatePassword(
    existingUser.password,
    password
  );
  if (!existingUser || !isPasswordValid)
    throw new UnauthorizdError("Invalid credentials provided");

  const token = await generateAccessToken(existingUser);

  res
    .status(200)
    .json({ data: { token, userId: existingUser._id.toString() } });
};

const logOut = (req: Request, res: Response, next: NextFunction) => {};

export { login, logOut };
