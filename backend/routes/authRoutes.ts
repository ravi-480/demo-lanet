import express from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// Authentication routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout",authenticate, authController.logout);
router.get("/", authenticate,authController.authGuard);
// Password reset routes
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

export default router;
