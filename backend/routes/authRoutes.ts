import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  authGuard,
  forgotPassword,
  checkRefreshToken,
  resetPassword,
  getMe,
} from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// Authentication routes
router.get("/me", authenticate, getMe);
router.get("/session", checkRefreshToken);
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, logout);
router.get("/", authenticate, authGuard);
// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
