"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = "") {
        var _a, _b;
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            // Use type assertion to avoid TypeScript error
            (_b = (_a = Error).captureStackTrace) === null || _b === void 0 ? void 0 : _b.call(_a, this, this.constructor);
        }
    }
}
exports.default = ApiError;
