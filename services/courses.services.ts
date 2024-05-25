import CourseModel from "../models/course.model";

export const createCourse = async (data: any) => {
  const course = await CourseModel.create(data);
  return course;
};
