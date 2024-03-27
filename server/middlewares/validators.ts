import { NextFunction, Request, Response } from "express";
import userValidationSchema from "../schemas/userValidationSchema";
import ClientError from "../exceptions/clientError";

const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = userValidationSchema.validate(req.body);

  if (error) {
    throw new ClientError(`Invalid data provided: ${error.details[0].message}`);
  }

  return next();
};

export { validateUser };
