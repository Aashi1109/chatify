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
import Joi from "joi";
import asyncHandler from "./asyncHandler";

/**
 * Generic validation middleware factory
 * @param schema - Joi validation schema to validate against
 */
const createValidator =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new ClientError(
        `Invalid data provided: ${error.details[0].message}`
      );
    }
    return next();
  };

const createAsyncValidator =
  (schema: Joi.ObjectSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.validateAsync(req.body);
      return next();
    } catch (error) {
      throw new ClientError(error.details?.[0]?.message);
    }
  };

export const validateUser = createValidator(userValidationSchema);
export const validateCreateMessage = createValidator(
  messageCreateValidationSchema
);
export const validateUpdateMessage = createValidator(
  messageUpdateValidationSchema
);
export const validateFileUploadData = createValidator(fileValidationSchema);
export const validateConversation = asyncHandler(
  createAsyncValidator(createConversationValidationSchema)
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
