import { EUserRoles } from "@definitions/enums";
import UserService from "@services/UserService";
import { NextFunction, Request, Response } from "express";

import { parseUserRole } from "@lib/helpers";
import { ICustomRequest } from "@definitions/interfaces";

const checkRoles =
  (roles: Array<EUserRoles>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const existingUser = await UserService.getUserById(
      (req as ICustomRequest).token.payload.id,
    );

    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const parsedUserRole = parseUserRole(existingUser.role);
    if (!roles.includes(parsedUserRole)) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    return next();
  };

export default checkRoles;
