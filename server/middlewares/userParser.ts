import { NextFunction, Request, Response } from "express";

import { IUserRequest } from "@definitions/interfaces";
import { UnauthorizedError } from "@exceptions";
import { User } from "@models";
import asyncHandler from "./asyncHandler";
import { getJWTPayload } from "@lib/helpers";
import { RedisCommonCache } from "@redis";

const userCache = new RedisCommonCache();

const userParser = async (req: Request, res: Response, next: NextFunction) => {
  const jwtCookie = req.cookies?.["jwt"];

  const unauthorizedError = new UnauthorizedError(`Missing or invalid token`);
  if (!Boolean(jwtCookie)) throw unauthorizedError;

  try {
    const { _id, username } = (await getJWTPayload(jwtCookie)) || {};
    let user = await userCache.methods.getKey(`user:${_id}`);

    if (!user) {
      user = await User.findOne({ _id, username });
      user &&
        userCache.methods.setString(
          `user:${user?._id}`,
          user?.toObject(),
          24 * 60 * 60
        );
    }

    if (!user) throw unauthorizedError;

    (req as IUserRequest).user = user;
  } catch (error) {
    throw unauthorizedError;
  }

  return next();
};

export default asyncHandler(userParser);
