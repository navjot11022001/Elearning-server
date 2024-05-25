import UserModel, { IUser } from "../models/user.model";

const getUserById = async (id: string) => {
  const user = await UserModel.findById(id);
  return user;
};
const createUser = async (body: any) => {
  const user = await UserModel.create(body);
  return user;
};

export { getUserById, createUser };
