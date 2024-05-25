import { Request, Response } from "express";
import cloudinary from "cloudinary";
import { uploadImage } from "../utils/cloudinary.utils";
import { createCourse } from "../services/courses.services";

export const uploadCourse = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { thumbnail } = data;
    if (thumbnail) {
      const { public_id, secure_url } = await uploadImage(thumbnail, "courses");
      data.thumbnail = {
        public_id,
        url: secure_url,
      };
    }
    const course = await createCourse(data);
    return res.status(201).json({
      success: true,
      message: "Course uploaded successfuly",
      course,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
