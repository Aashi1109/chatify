import { NextFunction, Request, Response } from "express";
import { CustomError, IResponseError } from "../exceptions/customError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (!(err instanceof CustomError)) {
    res.status(500).json({ message: "Internal server error. Try again later" });
  } else {
    const customError = err as CustomError;
    let response = { message: customError.message } as IResponseError;

    if (customError.additionalInfo) {
      response.additionalInfo = customError.additionalInfo;
    }

    res.status(customError.status).type("json").send(JSON.stringify(response));
  }
};
