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
exports.getIO = exports.initializeSocketIP = void 0;
const socket_io_1 = require("socket.io");
const eventModel_1 = __importDefault(require("../models/eventModel"));
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
let io;
const initializeSocketIP = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        socket.on("authenticate", (userId) => {
            socket.data.userId = userId;
            socket.join(`user:${userId}`);
            console.log(`User authenticated: ${userId}`);
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
        socket.on("notify-organizer", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { eventId, senderId, type, message, metadata } = data;
                // Ensure event exists
                const event = yield eventModel_1.default.findById(eventId);
                if (!event) {
                    console.log("Event not found:", eventId);
                    return;
                }
                const organizerId = event.creator.toString();
                // Create a new notification
                const notification = yield notificationModel_1.default.create({
                    userId: organizerId,
                    eventId,
                    message,
                    type,
                    metadata: Object.assign(Object.assign({}, metadata), { senderId }),
                });
                // Emit the notification to the specific user's room
                io.to(`user:${organizerId}`).emit("new-notification", notification);
                socket.emit("notification-sent", { success: true, notification });
                console.log("Notification sent to organizer:", organizerId);
            }
            catch (error) {
                console.error("Error sending notification:", error);
                socket.emit("notification-sent", {
                    success: false,
                    error: "Failed to send notification",
                });
            }
        }));
    });
    return io;
};
exports.initializeSocketIP = initializeSocketIP;
const getIO = () => io;
exports.getIO = getIO;
