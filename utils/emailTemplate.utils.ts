import jwt, { Secret } from "jsonwebtoken";

interface IActivationToken {
  token: string;
  activationCode: string;
}

const createActivationToken = (user: any): IActivationToken => {
  const activationCode = (Math.floor(Math.random() * 9000) + 1000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "15m",
    }
  );
  return { token, activationCode };
};

export { IActivationToken, createActivationToken };
