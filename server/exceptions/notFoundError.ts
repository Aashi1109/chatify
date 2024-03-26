import { CustomError } from "./customError";

class NotFoundError extends CustomError {
  constructor(message) {
    super(message, 404);
  }
}

export default NotFoundError;
