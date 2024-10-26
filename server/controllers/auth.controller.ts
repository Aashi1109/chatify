import {NextFunction, Request, Response} from "express";

import {NotFoundError} from "@exceptions";
import ClientError from "@exceptions/clientError";
import UnauthorizedError from "@exceptions/unauthorizedError";
import UserService from "@services/UserService";
import {generateAccessToken, validatePassword} from "@lib/helpers";

/**
 * Logins the user by creating a new access token
 * @param req Request object containing the request
 * @param res Response object containing the response
 */
const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    throw new ClientError("Username and password are required");
  }

  const existingUser = await UserService.getUserByUsername(username);

  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  const isPasswordValid = await validatePassword(
    existingUser.password,
    password,
  );
  if (!existingUser || !isPasswordValid)
    throw new UnauthorizedError("Invalid credentials provided");

  const token = await generateAccessToken(existingUser);

  res.status(200).json({
    data: { token, userId: existingUser._id.toString() },
    success: true,
  });
};

const logOut = (req: Request, res: Response, next: NextFunction) => {};

export { login, logOut };
