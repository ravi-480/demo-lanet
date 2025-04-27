"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Authentication routes
router.get("/me", authMiddleware_1.authenticate, authController_1.getMe);
router.post("/signup", authController_1.signup);
router.post("/login", authController_1.login);
router.post("/refresh-token", authController_1.refreshToken);
router.post("/logout", authMiddleware_1.authenticate, authController_1.logout);
router.get("/", authMiddleware_1.authenticate, authController_1.authGuard);
// Password reset routes
router.post("/forgot-password", authController_1.forgotPassword);
router.post("/reset-password", authController_1.resetPassword);
exports.default = router;
