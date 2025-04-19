import { Request, Response, NextFunction } from "express";
import { generateToken, verifyToken } from "../utils/jwtHelper";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import User from "../models/UserModel";
import { generateAccessToken } from "../services/authService";
interface AuthRequest extends Request {
  user?: any;
}
export const authenticate = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    try {
      // Try verifying access token
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (err) {
      console.log("Access token expired or invalid. Trying refresh...");

      // If access token failed, try refresh token
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new ApiError(401, "Session expired. Please log in again.");
      }

      try {
        // Decode refresh token
        const decodedRefresh: any = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        );

        // Optional: check if refresh token exists in DB or is revoked
        const user = await User.findById(decodedRefresh.id);
        if (!user) {
          throw new ApiError(401, "Invalid refresh token");
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user.id, user.email);

        console.log(newAccessToken);

        // Set new access token in cookie
        res.cookie("token", newAccessToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 1 * 60 * 1000, // 10 seconds in milliseconds
        });
        
        // Attach user to request
        req.user = { id: user._id };
        return next();
      } catch (refreshErr) {
        console.error("Refresh token failed:", refreshErr);
        throw new ApiError(401, "Session expired. Please log in again.");
      }
    }
  }
);
