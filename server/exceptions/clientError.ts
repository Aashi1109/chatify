import { CustomError } from "./customError";

class ClientError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export default ClientError;
