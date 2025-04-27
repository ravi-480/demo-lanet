"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.refreshAccessToken = exports.login = exports.signup = exports.generateAccessToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const crypto_1 = __importDefault(require("crypto"));
const emailService_1 = require("../utils/emailService");
const UserModel_1 = __importDefault(require("../models/UserModel"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Environment variables with fallbacks
const JWT_ACCESS_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;
// Generate tokens
const generateAccessToken = (userId, email, name) => {
    return jsonwebtoken_1.default.sign({ id: userId, email, name }, JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
};
// Auth service functions
const signup = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    if (userData.password !== userData.confirmPassword) {
        throw new ApiError_1.default(400, "Passwords do not match");
    }
    const existingUser = yield UserModel_1.default.findOne({ email: userData.email });
    if (existingUser) {
        throw new ApiError_1.default(409, "Email already in use");
    }
    // Create new user
    const user = yield UserModel_1.default.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
    });
    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        },
    };
});
exports.signup = signup;
// login user
const login = (loginData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield UserModel_1.default.findOne({ email: loginData.email }).select("+password");
    if (!user || !(yield user.comparePassword(loginData.password))) {
        throw new ApiError_1.default(401, "Invalid email or password");
    }
    // Generate tokens
    const accessToken = (0, exports.generateAccessToken)(user._id.toString(), user.email, user.name);
    const refreshToken = generateRefreshToken(user._id.toString());
    // Store refresh token in database
    user.refreshToken = refreshToken;
    yield user.save();
    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        },
    };
});
exports.login = login;
const refreshAccessToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        // Find user with this refresh token
        const user = yield UserModel_1.default.findById(decoded.id).select("+refreshToken");
        if (!user || user.refreshToken !== token) {
            throw new ApiError_1.default(401, "Invalid refresh token");
        }
        // Generate new tokens
        const accessToken = (0, exports.generateAccessToken)(user._id.toString(), user.email, user.name);
        const refreshToken = generateRefreshToken(user._id.toString());
        // Update refresh token in database
        user.refreshToken = refreshToken;
        yield user.save();
        // Return both tokens
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError_1.default(401, "Invalid refresh token");
    }
});
exports.refreshAccessToken = refreshAccessToken;
const logout = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Clear refresh token in database
    yield UserModel_1.default.findByIdAndUpdate(userId, { refreshToken: null });
});
exports.logout = logout;
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    // Find user by email
    const user = yield UserModel_1.default.findOne({ email });
    if (!user)
        return;
    // Generate random token
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    // Hash the token before storing in the database
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    // Set token and expiry on user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    yield user.save();
    // Create reset URL
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    // Send email with reset link
    try {
        yield (0, emailService_1.sendEmail)({
            to: user.email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}`,
            html: `<p>You requested a password reset.</p><p>Please click <a href="${resetUrl}">here</a> to reset your password.</p><p>If you didn't request this, please ignore this email.</p><p>This link will expire in 10 minutes.</p>`,
        });
    }
    catch (error) {
        // If email sending fails, clear the reset token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        throw new ApiError_1.default(500, "Failed to send password reset email");
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (token, password, confirmPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (password !== confirmPassword) {
        throw new ApiError_1.default(400, "Passwords do not match");
    }
    // Hash the token to compare with the one in the database
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    // Find user with this token and check if token has expired
    const user = yield UserModel_1.default.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        throw new ApiError_1.default(400, "Invalid or expired password reset token");
    }
    // Set new password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Also clear refresh token to force re-login
    user.refreshToken = undefined;
    yield user.save();
});
exports.resetPassword = resetPassword;
