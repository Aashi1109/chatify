import { Request, Response } from "express";

import { NotFoundError } from "@exceptions";
import ClientError from "@exceptions/clientError";
import UnauthorizedError from "@exceptions/unauthorizedError";
import UserService from "@services/UserService";
import { generateAccessToken, validatePassword } from "@lib/helpers";
import { IUserRequest } from "@definitions/interfaces";
import { User } from "@models";

/**
 * Logins the user by creating a new access token
 * @param req Request object containing the request
 * @param res Response object containing the response
 */
const login = async (req: Request, res: Response) => {
  const { username, password, rememberUser } = req.body;

  if (!(username && password)) {
    throw new ClientError("Username and password are required");
  }

  const existingUser = await User.findOne({ username }).select("+password");

  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  const isPasswordValid = await validatePassword(
    existingUser.password,
    password
  );

  if (!existingUser || !isPasswordValid)
    throw new UnauthorizedError("Invalid credentials provided");

  const token = await generateAccessToken(existingUser);

  res.cookie("jwt", token, {
    maxAge: rememberUser ? 30 * 60 * 24 * 60 * 1000 : null,
  });

  return res.status(200).json({
    data: { user: existingUser },
    success: true,
  });
};

const logOut = (req: Request, res: Response) => {
  res.clearCookie("jwt");
  return res.status(200).json({ data: "Logout successful", success: true });
};

const session = (req: Request, res: Response) => {
  const { user } = req as IUserRequest;

  return res.status(200).json({ data: user });
};

export { login, logOut, session };
