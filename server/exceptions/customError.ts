export class CustomError extends Error {
  message!: string;
  status!: number;
  additionalInfo!: any;

  constructor(
    message: string,
    status: number = 500,
    additinonalInfo: any = undefined
  ) {
    super(message);
    this.message = message;
    this.status = status;
    this.additionalInfo = additinonalInfo;
  }
}

export interface IResponseError {
  message: string;
  additionalInfo?: string;
}
