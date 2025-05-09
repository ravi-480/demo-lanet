import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

// Validate signup request
export const validateSignup = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check if all required fields are present
  if (!name || !email || !password || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  // Validate password complexity
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password should be mixture of one uppercase, lowercase, number & special character"
    );
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  next();
};

// Validate login request
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  // Check if all required fields are present
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (password.trim() === "") {
    throw new ApiError(400, "Password cannot be empty");
  }

  next();
};

// Validate forgot password request
export const validateForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  next();
};

// Validate reset password request
export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate password complexity
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password should be mixture of one uppercase, lowercase, number & special character"
    );
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  next();
};
