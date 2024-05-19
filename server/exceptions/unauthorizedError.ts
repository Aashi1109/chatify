import CustomError from "./customError";

/**
 * Custom error class for unauthorized errors.
 * Extends the `CustomError` class.
 */
class UnauthorizedError extends CustomError {
  /**
   * Creates a new `UnauthorizedError` instance.
   * @param message The error message.
   */
  constructor(message: string) {
    super(message, 401);
  }
}

/**
 * Exports the `UnauthorizedError` class.
 */
export default UnauthorizedError;
