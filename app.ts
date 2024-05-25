require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/user.routes";
import CourseRouter from "./routes/course.routes";
const app = express();
const { ORIGIN } = process.env;

//body parser
app.use(express.json({ limit: "50mb" }));
//parsinght eincoming cookie
app.use(cookieParser());
//cross origin resourse sharing

app.use(
  cors({
    origin: ORIGIN,
  })
);
app.use("/api/v1", UserRouter);
app.use("/api/v1", CourseRouter);

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({ mesage: "server working fine" });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

export { app };
