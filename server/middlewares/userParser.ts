import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import config from "@config";
import { IUserRequest } from "@definitions/interfaces";
import { UnauthorizedError } from "@exceptions";
import { User } from "@models";
import asyncHandler from "./asyncHandler";
import { getJWTPayload } from "@lib/helpers";

const userParser = async (req: Request, res: Response, next: NextFunction) => {
  const jwtCookie = req.cookies?.["jwt"];

  const unauthorizedError = new UnauthorizedError(`Missing or invalid token`);
  if (!Boolean(jwtCookie)) throw unauthorizedError;

  try {
    const { _id, username } = (await getJWTPayload(jwtCookie)) || {};
    const user = await User.findOne({ _id, username });

    if (!user) throw unauthorizedError;

    (req as IUserRequest).user = user;
  } catch (error) {
    throw unauthorizedError;
  }

  return next();
};

export default asyncHandler(userParser);
