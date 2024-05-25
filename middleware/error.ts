import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../ErrorHandler";
import { I_ERROR_MAP } from "../common/constants/error";

export const ErrorMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    next();
  } catch (err: any) {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    const error = new ErrorHandler(err);
    res.status(error.statusCode).json(error);
  }
};
