import { NextFunction, Request, Response } from "express";

import ClientError from "../exceptions/clientError";
import { getUserByUsername } from "../state/user";
import { generateAccessToken, validatePassword } from "../utils/helpers";
import UnauthorizdError from "../exceptions/unauthorizedError";

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    throw new ClientError("Username and password are required");
  }

  const existingUser = await getUserByUsername(username);

  const isPasswordValid = await validatePassword(
    existingUser.password,
    password
  );
  if (!existingUser || !isPasswordValid)
    throw new UnauthorizdError("Invalid credentials provided");

  const token = await generateAccessToken(existingUser);

  res.status(200).json({ token });
};

const logOut = (req: Request, res: Response, next: NextFunction) => {};

export { login, logOut };
