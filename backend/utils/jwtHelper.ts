import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ApiError from "./ApiError";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}
interface DecodedUser {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const verifyToken = (token: string): DecodedUser | null => {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as DecodedUser;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
};
