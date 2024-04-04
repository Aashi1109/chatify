import CustomError from "./customError";

/**
 * Represents an error that occurs due to client-side input or behavior.
 * Extends the CustomError class.
 * @class ClientError
 * @extends CustomError
 */
class ClientError extends CustomError {
  /**
   * Creates a new instance of ClientError.
   * @constructor
   * @param {string} message - The error message.
   */
  constructor(message) {
    super(message, 400); // Passes the error message and HTTP status code (400 Bad Request) to the parent constructor
  }
}

export default ClientError;
