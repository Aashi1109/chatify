import { NextFunction, Request, Response } from "express";

import { EUserRoles } from "../definitions/enums";
import { getUserById } from "../state/user";
import { CustomRequest } from "./checkJwt";

const checkRoles =
  (roles: Array<EUserRoles>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const existingUser = await getUserById(
      (req as CustomRequest).token.payload.id
    );
    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist" });
    }
    if (!roles.includes(EUserRoles[existingUser.role])) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    return next();
  };

export default checkRoles;