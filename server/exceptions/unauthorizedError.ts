import { CustomError } from "./customError";

/**
 * Custom error class for unauthorized errors.
 * Extends the `CustomError` class.
 */
class UnauthorizdError extends CustomError {
  /**
   * Creates a new `UnauthorizdError` instance.
   * @param message The error message.
   */
  constructor(message) {
    super(message, 401);
  }
}

/**
 * Exports the `UnauthorizdError` class.
 */
export default UnauthorizdError;
