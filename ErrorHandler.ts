import { I_ERROR_MAP } from "./common/constants/error";

class ErrorHandler extends Error {
  statusCode: number;
  errorCode: string;
  constructor(err: I_ERROR_MAP) {
    super();
    this.message = err.message;
    this.statusCode = err.statusCode;
    this.errorCode = err.errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
