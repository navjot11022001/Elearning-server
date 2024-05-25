require("dotenv").config();
import { Redis } from "ioredis";

const redisClient = (): string => {
  const { REDIS_URL } = process.env;
  if (REDIS_URL) {
    console.log("Redis client connected successFully");
    return REDIS_URL;
  } else throw new Error("REdis connection failed");
};

export const redis = new Redis(redisClient());
