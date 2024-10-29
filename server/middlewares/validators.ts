import { NextFunction, Request, Response } from "express";

import ClientError from "@exceptions/clientError";
import fileValidationSchema from "@schemas/fileValidationSchema";
import {
  messageCreateValidationSchema,
  messageUpdateValidationSchema,
} from "@schemas/messageValidationSchema";
import userValidationSchema from "@schemas/userValidationSchema";
import mongoose from "mongoose";
import { createConversationValidationSchema } from "@schemas/conversationValidation";

/**
 * Generic validation middleware factory
 * @param schema - Joi validation schema to validate against
 */
const createValidator =
  (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new ClientError(
        `Invalid data provided: ${error.details[0].message}`
      );
    }
    return next();
  };

export const validateUser = createValidator(userValidationSchema);
export const validateCreateMessage = createValidator(
  messageCreateValidationSchema
);
export const validateUpdateMessage = createValidator(
  messageUpdateValidationSchema
);
export const validateFileUploadData = createValidator(fileValidationSchema);
export const validateConversation = createValidator(
  createConversationValidationSchema
);

export const validateMongooseIds =
  (paramIds: Array<string>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const errorMessages = [];
    for (const paramName of paramIds) {
      const id = req.query?.[paramName];
      if (!id) continue;

      const ids = Array.isArray(id) ? id : [id];

      for (const singleId of ids) {
        const normalizedId =
          singleId === "null" || singleId === "undefined" ? null : singleId;

        if (!mongoose.Types.ObjectId.isValid(normalizedId as string)) {
          errorMessages.push(
            `Invalid ID provided: ${paramName} -> ${normalizedId}, expecting Mongoose ObjectId`
          );
        }
      }
    }

    if (errorMessages.length) {
      throw new ClientError(
        `Provided id(s) validation failed`,
        errorMessages.join(", ")
      );
    }
    return next();
  };
