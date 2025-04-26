import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper";
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
    let token: string | undefined = req.cookies?.token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (err) {
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

        // check if refresh token exists in DB or is revoked
        const user = await User.findById(decodedRefresh.id);
        if (!user) {
          throw new ApiError(401, "Invalid refresh token");
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(
          user.id,
          user.email,
          user.name
        );

        // Set new access token in cookie
        res.cookie("token", newAccessToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 40 * 60 * 1000,
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
