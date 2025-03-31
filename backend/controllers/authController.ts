import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/authService";
import {
  ILoginRequest,
  ISignupRequest,
  IForgotPasswordRequest,
  IResetPasswordRequest,
} from "../interfaces/user.interface";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const userData: ISignupRequest = req.body;
  const result = await authService.signup(userData);

  // Store refresh token in HttpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  res.status(201).json({
    success: true,
    message: "Signup successful",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const loginData: ILoginRequest = req.body;
  const result = await authService.login(loginData);

  // Store refresh token in HttpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    // Get new access token
    const accessToken = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Get user ID from request (assuming it's set by auth middleware)
  const userId = (req as any).user?.id;

  // Clear refresh token from cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  // If we have a user ID, also clear the token in the database
  if (userId) {
    await authService.logout(userId);
  }

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email }: IForgotPasswordRequest = req.body;

    // Call service to handle the forgot password process
    const result = await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message:
        "If that email exists in our system, we've sent a password reset link",
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const resetData: IResetPasswordRequest = req.body;

    // Call service to handle password reset
    await authService.resetPassword(
      resetData.token,
      resetData.password,
      resetData.confirmPassword
    );

    res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. Please login with your new password.",
    });
  }
);
