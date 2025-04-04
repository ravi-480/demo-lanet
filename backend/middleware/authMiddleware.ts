import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;
    ``;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Fallback to cookies if no Authorization header
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }


    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      console.log("User authenticated:", req.user); // ✅ Debug log
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      throw new ApiError(401, "Invalid or expired token");
    }
  }
);
