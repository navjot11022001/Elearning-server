import { HTTP_STATUS_CODES } from "./http.constants";

const ERRORS = {
  USER_NOT_FOUND: {
    statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
    message: "User not found",
  },
  USER_EXISTS: {
    statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
    message: "User already exists",
  },
  INVALID_TOKEN: {
    statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
    message: "Invalid token",
  },
  INVALID_PASSWORD: {
    statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
    message: "Invalid password",
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
  },
  BAD_REQUEST: {
    statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
    message: "Bad request",
  },
  UNAUTHORIZED: {
    statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
    message: "Unauthorized",
  },
  FORBIDDEN: {
    statusCode: HTTP_STATUS_CODES.FORBIDDEN,
    message: "Forbidden",
  },
  NOT_FOUND: {
    statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
    message: "Not found",
  },
};
export { ERRORS };
