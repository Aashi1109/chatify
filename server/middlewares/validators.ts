import { NextFunction, Request, Response } from "express";
import userValidationSchema from "../schemas/userValidationSchema";
import ClientError from "../exceptions/clientError";

/**
 * Validates user input against a predefined schema.
 * @function validateUser
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @throws {ClientError} If the provided data is invalid.
 */
const validateUser = (req, res, next) => {
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

export { validateUser };
