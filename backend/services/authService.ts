import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import { sendEmail } from "../utils/emailService"; // You'll need to implement this

import User from "../models/UserModel";
import ApiError from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  ISignupRequest,
  ILoginRequest,
  IAuthResponse,
} from "../interfaces/user.interface";

// Environment variables with fallbacks (use actual env vars in production)
const JWT_ACCESS_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = "refresh-secret-key";
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d";

// Generate tokens
const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

// Auth service functions
export const signup = async (
  userData: ISignupRequest
): Promise<IAuthResponse> => {
  if (userData.password !== userData.confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  // Create new user
  const user = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString(), user.email);
  const refreshToken = generateRefreshToken(user._id.toString());

  // Store refresh token in database
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};

export const login = async (
  loginData: ILoginRequest
): Promise<IAuthResponse> => {
  const user = await User.findOne({ email: loginData.email }).select(
    "+password"
  );

  if (!user || !(await user.comparePassword(loginData.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString(), user.email);
  const refreshToken = generateRefreshToken(user._id.toString());

  // Store refresh token in database
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};

export const refreshAccessToken = async (token: string): Promise<string> => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };

    // Find user with this refresh token
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Generate new access token
    return generateAccessToken(user._id.toString(), user.email);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
};

export const logout = async (userId: string): Promise<void> => {
  // Clear refresh token in database
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// ... (your existing service functions) ...

export const forgotPassword = async (email: string): Promise<void> => {
  // Find user by email
  const user = await User.findOne({ email });

  // Even if user doesn't exist, don't reveal that information
  if (!user) return;

  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token before storing in the database
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token and expiry on user
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  // Create reset URL
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  // Send email with reset link
  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}`,
      html: `<p>You requested a password reset.</p><p>Please click <a href="${resetUrl}">here</a> to reset your password.</p><p>If you didn't request this, please ignore this email.</p><p>This link will expire in 10 minutes.</p>`,
    });
  } catch (error) {
    // If email sending fails, clear the reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    throw new ApiError(500, "Failed to send password reset email");
  }
};

export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string
): Promise<void> => {
  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  // Hash the token to compare with the one in the database
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with this token and check if token has expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  // Set new password and clear reset token fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  // Also clear refresh token to force re-login
  user.refreshToken = undefined;

  await user.save();
};
