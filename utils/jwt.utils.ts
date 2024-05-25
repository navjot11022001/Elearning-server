require("dotenv").config();
import { IUser } from "../models/user.model";
import { Response } from "express";
import { redis } from "../config/redis/connection";
import jwt, { JwtPayload } from "jsonwebtoken";
import { COOKIE_CONSTANTS } from "../common/constants/cookies.constants";
import { sanitizeEntity } from "./common.utils";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}
const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);
export const accessTokenOption: ITokenOptions = {
  expires: new Date(Date.now() * accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOption: ITokenOptions = {
  expires: new Date(Date.now() * refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = async (
  user: IUser,
  statusCode: number,
  res: Response
): Promise<void> => {
  const accessToken = await user.SignAccessToken();
  const refreshToken = await user.SignRefreshToken();

  //upload session to redis
  redis.set(user._id as string, JSON.stringify(user) as any);
  /** parse environment variakes to integrate with fallback values */

  res.cookie(COOKIE_CONSTANTS.ACCESS_TOKEN, accessToken, accessTokenOption);
  res.cookie(COOKIE_CONSTANTS.REFRESH_TOKEN, refreshToken, refreshTokenOption);

  const userObject = JSON.parse(JSON.stringify(user));

  res.status(statusCode).json({
    success: true,
    user: sanitizeEntity(userObject),
    accessToken,
  });
};

export const validateToken = (token: string, secretKey: string): JwtPayload => {
  return jwt.verify(token, secretKey) as JwtPayload;
};
