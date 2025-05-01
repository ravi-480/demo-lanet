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

    // Check if token exists
    if (!token) {
      // Check if refresh token exists
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        // No refresh token available, immediately indicate this to the client
        throw new ApiError(
          401,
          "NO_REFRESH_TOKEN:Session expired. Please log in again."
        );
      }

      // We have a refresh token but no access token
      throw new ApiError(401, "Access token required");
    }

    try {
      // Verify the token
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (err: any) {
      // Token verification failed (expired or invalid)
      if (err.message === "jwt expired") {
        throw new ApiError(401, "Token expired");
      } else {
        throw new ApiError(401, "Authentication failed");
      }
    }
  }
);
