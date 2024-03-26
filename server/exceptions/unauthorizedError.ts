import { CustomError } from "./customError";

class UnauthorizdError extends CustomError {
  constructor(message) {
    super(message, 401);
  }
}

export default UnauthorizdError;
