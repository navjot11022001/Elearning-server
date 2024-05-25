import { NextFunction, Request, Response } from "express";
import { validateToken } from "../utils/jwt.utils";
import { JwtPayload } from "jsonwebtoken";
import { redis } from "../config/redis/connection";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = (req.cookies?.access_token as string) || "";
    if (!accessToken) {
      return res
        .status(400)
        .json({ message: "Please login to access this resource" });
    }
    const decode: JwtPayload = validateToken(
      accessToken,
      process.env.ACCESS_TOKEN as string
    );
    if (!decode) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    const user = await redis.get(decode?.id as string);
    if (!user) return res.status(404).json({ message: "User not found" });
    req.user = JSON.parse(user);
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return res
        .status(403)
        .json({ message: "Not allowd to access this resourse" });
    }
    next();
  };
};
