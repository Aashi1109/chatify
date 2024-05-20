import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import config from "@config";
import { ICustomRequest } from "@definitions/interfaces";

const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = <string>req.headers["authorization"];

  let jwtPayload;

  try {
    jwtPayload = <any>(
      verify(token?.split(" ")[1], config.jwt.secret, { complete: true })
    );

    (req as ICustomRequest).token = jwtPayload;
  } catch (error) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  return next();
};

export default checkJwt;
