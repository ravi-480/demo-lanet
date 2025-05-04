import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined = req.cookies?.token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new ApiError(401, "Session expired. Please log in again.");
      }

      throw new ApiError(
        401,
        "Access token missing. Please refresh your token."
      );
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (err: any) {
      if (err.message === "jwt expired") {
        throw new ApiError(401, "Token expired");
      } else {
        throw new ApiError(401, "Authentication failed");
      }
    }
  }
);
