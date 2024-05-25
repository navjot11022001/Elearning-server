import express from "express";
import { uploadCourse } from "../controllers/course.constorlle";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.middleware";
import { ROLES } from "../constants/common.constants";
const CourseRouter = express.Router();

CourseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles(ROLES.ADMIN),
  uploadCourse
);

export default CourseRouter;
