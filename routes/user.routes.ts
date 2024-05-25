import { Router } from "express";
import {
  activationUser,
  getUserInfo,
  loginUser,
  logoutUser,
  registrationUser,
  socialAuth,
  updateProfilePicture,
  updateUserInfo,
  updateUserPassword,
  updateUserToken,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.middleware";

const UserRouter = Router();

UserRouter.post("/registration", registrationUser);

UserRouter.post("/activate-user", activationUser);

UserRouter.post("/login", loginUser);

UserRouter.get("/logout", isAuthenticated, logoutUser);

UserRouter.get("/refreshtoken", updateUserToken);

UserRouter.get("/me", isAuthenticated, getUserInfo);

UserRouter.post("/social-auth", socialAuth);

UserRouter.put("/update-user-info", isAuthenticated, updateUserInfo);

UserRouter.put("/update-password", isAuthenticated, updateUserPassword);

UserRouter.put("/update-user-avatar", isAuthenticated, updateProfilePicture);
export default UserRouter;
