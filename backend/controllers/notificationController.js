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
exports.getNotificationForUser = exports.markAllRead = exports.createNewNotification = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const eventModel_1 = __importDefault(require("../models/eventModel"));
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const socketUtils_1 = require("../utils/socketUtils");
exports.createNewNotification = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, senderId, recipientId, message, type, metadata } = req.body;
        // If no recipientId is provided, we need to find it from the event
        let targetUserId = recipientId;
        if (!targetUserId) {
            const event = yield eventModel_1.default.findById(eventId);
            if (!event) {
                throw new ApiError_1.default(404, "Event not found");
            }
            targetUserId = event.creator.toString();
        }
        // Create the notification
        const notification = yield notificationModel_1.default.create({
            userId: targetUserId,
            eventId,
            type,
            message,
            metadata: Object.assign(Object.assign({}, metadata), { senderId }),
        });
        return res.status(201).json({ success: true, notification });
    }
    catch (error) {
        console.error("Notification send error:", error);
        throw new ApiError_1.default(500, "Internal server error");
    }
}));
exports.markAllRead = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!userId) {
        throw new ApiError_1.default(400, "User ID is required");
    }
    yield notificationModel_1.default.updateMany({ userId, status: "unread" }, { $set: { status: "read" } });
    const io = (0, socketUtils_1.getIO)();
    io.to(`user:${userId}`).emit("notifications-marked-read");
    return res.status(200).json({
        status: "success",
        msg: "All notification marked as Read successfully",
    });
}));
exports.getNotificationForUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.query.userId;
        if (!userId) {
            throw new ApiError_1.default(400, "User Id is required");
        }
        const notifications = yield notificationModel_1.default.find({
            userId,
            status: "unread",
        })
            .sort({ createdAt: -1 })
            .limit(20);
        return res.status(200).json({ success: true, notifications });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        throw new ApiError_1.default(500, "Internal server error");
    }
}));
