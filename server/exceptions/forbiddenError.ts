import { CustomError } from "./customError";

class ForbiddenError extends CustomError {
  constructor(message) {
    super(message, 403);
  }
}

export default ForbiddenError;
