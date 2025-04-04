import jwt from "jsonwebtoken";
import { IUser } from "../interfaces/user.interface";
import dotenv from "dotenv";
import ApiError from "./ApiError";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}
interface DecodedUser {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (user: Pick<IUser, "id" | "email">): string => {
  const payload = { id: user.id, email: user.email };
  const options = { expiresIn: JWT_EXPIRES_IN };
  return (jwt.sign as any)(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): DecodedUser | null => {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as DecodedUser;
  } catch (error) {
    console.error("Invalid or expired token:", error);
    throw new ApiError(401, "Invalid or expired token");
  }
};
