import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  authGuard,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// Authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, logout);

// session verification and user data routes
router.get("/me", authenticate, getMe);
router.get("/", authenticate, authGuard);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
