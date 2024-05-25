require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import UserModel, { IUser } from "../models/user.model";
import jwt, { Secret } from "jsonwebtoken";
import { sendMail } from "../utils/mails.utils";
import {
  accessTokenOption,
  refreshTokenOption,
  sendToken,
  validateToken,
} from "../utils/jwt.utils";
import { COOKIE_CONSTANTS } from "../common/constants/cookies.constants";
import { redis } from "../config/redis/connection";
import {
  createActivationToken,
  IActivationToken,
} from "../utils/emailTemplate.utils";
import { createUser, getUserById } from "../services/user.services";
import cloudinary from "cloudinary";
import { sanitizeEntity } from "../utils/common.utils";
/** POST : /registration */
export interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
export const registrationUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Please send all the fields" });
  const isEmailExist = await UserModel.findOne({ email });
  if (isEmailExist) return res.status(400).json({ msg: "User Already exist" });
  //   throw new Error("enter username and password");
  const user: IRegistrationBody = { name, email, password };
  const activationToken: IActivationToken = createActivationToken(user);
  const { activationCode } = activationToken;
  const data = { user: { name: user.name }, activationCode };
  try {
    await sendMail({
      email: user.email,
      subject: "Account Report",
      template: "activation-mail.ejs",
      data,
    });
    return res.status(201).json({
      success: true,
      message: `Please check your email:${user.email} to actvate your account`,
      activationToken: activationToken.token,
    });
  } catch (err) {
    console.log("error while generating an email", err);
    return res.status(500).json({ message: "internal server error" });
  }
};

/** POST : /activation-user */
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}
export const activationUser = async (req: Request, res: Response) => {
  try {
    const { activation_code, activation_token } =
      req.body as IActivationRequest;

    const newUser: { user: IUser; activationCode: string } = jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET as string
    ) as { user: IUser; activationCode: string };
    const { user, activationCode } = newUser;

    if (activationCode !== activation_code) {
      return res.status(400).json({ msg: "Wrong otp" });
    }
    const { name, email, password } = user;
    const existUser = await UserModel.findOne({ email });
    if (existUser)
      return res.status(400).json({ msg: "bad request:User already exist" });
    await createUser({
      name,
      email,
      password,
    });
    return res.status(201).json({ message: "User created Successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", err });
  }
};

/** POST : /login */
interface ILoginRequest {
  email: string;
  password: string;
}
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as ILoginRequest;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all the feilds" });
    }
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "No User Exist" });
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "No User Exist", responseCode: "unauthorized" });
    }
    const { password: userPass, ...rest } = user;
    return sendToken(user, 200, res);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

/**Post: /logout user */
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie(COOKIE_CONSTANTS.ACCESS_TOKEN, "", { maxAge: 1 });
    res.cookie(COOKIE_CONSTANTS.REFRESH_TOKEN, "", { maxAge: 1 });
    redis.del(req.user?._id as string);
    return res.status(200).json({
      message: "Succeessfully logged out",
    });
  } catch (err: any) {
    return res.status(500).json({ message: "internal server error" });
  }
};

/**Put : /updateAccessToken */
export const updateUserToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies[COOKIE_CONSTANTS.REFRESH_TOKEN] as string;
    const decodedToken = validateToken(
      refreshToken,
      process.env.REFRESH_TOKEN as string
    );
    if (!decodedToken)
      return res
        .status(400)
        .json({ message: "Could not refresh token due to expiration" });
    const session = (await redis.get(decodedToken.id as string)) as string;
    if (!session) {
      return res.status(403).json({
        message: "session expired please login again",
      });
    }

    const user = JSON.parse(session);
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN as string,
      {
        expiresIn: "5m",
      }
    );
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN as string,
      {
        expiresIn: "3d",
      }
    );
    req.user = user;
    res.cookie(COOKIE_CONSTANTS.ACCESS_TOKEN, accessToken, accessTokenOption);
    res.cookie(
      COOKIE_CONSTANTS.REFRESH_TOKEN,
      newRefreshToken,
      refreshTokenOption
    );
    return res.status(200).json({
      message: "successs",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not refresh token Internal server error",
      error,
    });
  }
};

/**Get : /me */
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const id: string = req.user?._id as string;
    let user = await redis.get(id);
    user = !user ? ((await getUserById(id)) as any) : JSON.parse(user);
    if (!user) throw new Error("Error while getting the user");
    return res.status(200).json({
      message: "success",
      user: sanitizeEntity(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

/**Get : /social-auth */
interface ISocialAuth {
  name: string;
  email: string;
  avatar: string;
}
export const socialAuth = async (req: Request, res: Response) => {
  try {
    const { name, email, avatar } = req.body as ISocialAuth;
    if (!email)
      res.status(400).json({
        message: "Some fields are missing in the body",
        errorCode: "BAD_REQUEST",
      });
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      sendToken(existingUser, 200, res);
    } else {
      const user = await UserModel.create({ name, email, avatar });
      sendToken(user, 200, res);
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**PUT /user-info */
interface IUpdateUserInfo {
  name: string;
  email: string;
}
export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body as IUpdateUserInfo;
    const userId = req.user?._id as string;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    if (email && user) {
      const isEmailExist = await UserModel.findOne({ email });
      if (isEmailExist)
        return res.status(400).json({ message: "Email Already exist" });
      user.email = email;
    }
    if (name && user) {
      user.name = name;
    }
    await user?.save();
    await redis.set(userId, JSON.stringify(user));
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {}
};

/**PUT : /update-password */
interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}
export const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body as IUpdatePassword;
    if (!oldPassword || !newPassword)
      return res.status(400).json({
        message: "Required fields are missing",
      });
    const user = await UserModel.findById(req.user?._id).select("+password");
    if (!user || !user.password)
      return res.status(400).json({
        message: "Invalid User",
      });
    const isPasswordMatch = await user?.comparePassword(oldPassword);
    if (!isPasswordMatch)
      return res.status(400).json({
        message: "Old Password value is not correct",
      });
    if (oldPassword === newPassword)
      return res.status(400).json({
        message: "Old Password must be different from the new password",
      });
    user.password = newPassword;
    await user.save();
    await redis.set(req.user?._id as string, JSON.stringify(user));
    return res.status(201).json({ success: true, user });
  } catch (err) {
    return res.send(200).json({ message: "Internal Server error", err });
  }
};

/**PUT : /update-profile-picture */
interface IUpdateProfilePicture {
  avatar: string;
}
export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const { avatar } = req.body as IUpdateProfilePicture;
    const userId = req.user?._id as string;
    const user = await UserModel.findById(userId);
    if (avatar && user) {
      if (user?.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
      } else {
        const mycloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 159,
        });
        user.avatar = {
          public_id: mycloud.public_id,
          url: mycloud.secure_url,
        };
      }
      await user?.save();
      await redis.set(userId, JSON.stringify(user));
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {}
};
