import { NextFunction, Request, Response } from "express";

import ClientError from "@exceptions/clientError";
import fileValidationSchema from "@schemas/fileValidationSchema";
import {
  messageCreateValidationSchema,
  messageUpdateValidationSchema,
} from "@schemas/messageValidationSchema";
import userValidationSchema from "@schemas/userValidationSchema";
import mongoose from "mongoose";

/**
 * Validates user input against a predefined schema.
 * @function validateUser
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @throws {ClientError} If the provided data is invalid.
 */
const validateUser = (req: Request, res: Response, next: NextFunction) => {
  // Validate user input against a predefined schema
  const { error, value } = userValidationSchema.validate(req.body);

  // Check if there's an error in the validation result
  if (error) {
    // If there's an error, throw a ClientError with a message describing the invalid data
    throw new ClientError(`Invalid data provided: ${error.details[0].message}`);
  }

  // If validation passes, call the next middleware function
  return next();
};

const validateCreateMessage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = messageCreateValidationSchema.validate(req.body);

  if (error) {
    throw new ClientError(`Invalid data provided: ${error.details[0].message}`);
  }

  return next();
};
const validateUpdateMessage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = messageUpdateValidationSchema.validate(req.body);

  if (error) {
    throw new ClientError(`Invalid data provided: ${error.details[0].message}`);
  }

  return next();
};
const validateFileUploadData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = fileValidationSchema.validate(req.body);

  if (error) {
    throw new ClientError(`Invalid data provided: ${error.details[0].message}`);
  }

  return next();
};

const validateMongooseIds =
  (paramIds: Array<string>) =>
  (req: Request, res: Response, next: NextFunction) => {
    paramIds.forEach((paramName) => {
      const id = req.params?.[paramName];

      if (!id) {
        return next();
      }

      // Normalize the ID
      const normalizedId = id === "null" ? null : id;

      // Check if the normalized ID is null or a valid Mongoose ObjectId
      if (!normalizedId || !mongoose.Types.ObjectId.isValid(normalizedId)) {
        throw new ClientError(
          `Invalid ID for parameter: ${paramName} -> ${normalizedId}`
        );
      }

      // // Attach the normalized ID to the request object for further use
      // req[`validated_${paramName}`] = normalizedId;
    });

    return next();
  };

export {
  validateCreateMessage,
  validateFileUploadData,
  validateMongooseIds,
  validateUpdateMessage,
  validateUser,
};
