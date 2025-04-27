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
exports.authenticate = void 0;
const jwtHelper_1 = require("../utils/jwtHelper");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const asyncHandler_1 = require("../utils/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const authService_1 = require("../services/authService");
exports.authenticate = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        throw new ApiError_1.default(401, "Authentication required");
    }
    try {
        const decoded = (0, jwtHelper_1.verifyToken)(token);
        req.user = decoded;
        return next();
    }
    catch (err) {
        const refreshToken = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.refreshToken;
        if (!refreshToken) {
            throw new ApiError_1.default(401, "Session expired. Please log in again.");
        }
        try {
            // Decode refresh token
            const decodedRefresh = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            // check if refresh token exists in DB or is revoked
            const user = yield UserModel_1.default.findById(decodedRefresh.id);
            if (!user) {
                throw new ApiError_1.default(401, "Invalid refresh token");
            }
            // Generate new access token
            const newAccessToken = (0, authService_1.generateAccessToken)(user.id, user.email, user.name);
            // Set new access token in cookie
            res.cookie("token", newAccessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 50 * 60 * 1000,
            });
            // Attach user to request
            req.user = { id: user._id };
            return next();
        }
        catch (refreshErr) {
            console.error("Refresh token failed:", refreshErr);
            throw new ApiError_1.default(401, "Session expired. Please log in again.");
        }
    }
}));
