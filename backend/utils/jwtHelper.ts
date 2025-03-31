import jwt from "jsonwebtoken";
import { IUser } from "../interfaces/user.interface";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = "your-secret-key";
const JWT_EXPIRES_IN = "7d";
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
  // Using type assertion
  return (jwt.sign as any)({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): DecodedUser | null => {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as DecodedUser;
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null;
  }
};
