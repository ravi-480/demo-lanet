import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log("Cookies received:", req.cookies);

    // Check for token in cookies first
    let token = req.cookies?.token;

    // If not in cookies, try Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      throw new ApiError(401, "Invalid or expired token");
    }
  }
);
