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
exports.formatEmailTemplate = exports.createNotification = void 0;
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const socketUtils_1 = require("./socketUtils");
const createNotification = (userId, eventId, message, type, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notificationModel_1.default.create({
        userId,
        eventId,
        message,
        type,
        status: "unread",
        metadata,
    });
    const io = (0, socketUtils_1.getIO)();
    if (io) {
        io.to(`user:${userId}`).emit("new-notification", notification);
    }
    return notification;
});
exports.createNotification = createNotification;
const formatEmailTemplate = (event, guest, isReminder = false) => {
    const { name: eventName, date, location, description, eventType, _id: eventId, } = event;
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const capitalizedEventType = eventType.charAt(0).toUpperCase() + eventType.slice(1);
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>${isReminder ? "We Miss Your RSVP!" : "You're Invited!"}</h2>
      <h3>${eventName} - ${capitalizedEventType}</h3>
      
      <p>Hello ${guest.name || "there"},</p>
      
      <p>${isReminder
        ? "This is a friendly reminder to RSVP for our upcoming"
        : "You are cordially invited to attend our"} ${eventType} event.</p>
      
      <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Details:</strong> ${description}</p>
      </div>
      
      <p>${isReminder
        ? "Please respond by clicking the button below:"
        : "Please let us know if you can attend by clicking the button below:"}</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/rsvp/respond?eventId=${eventId}&guestId=${guest._id}"
          style="background-color: ${isReminder ? "#f97316" : "#0ea5e9"}; padding: 12px 25px; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          ${isReminder ? "RSVP Now" : "Respond to Invitation"}
        </a>
      </div>
      
      <p>${isReminder
        ? "We hope to hear from you soon!"
        : "We look forward to celebrating with you!"}</p>
    </div>
  `;
};
exports.formatEmailTemplate = formatEmailTemplate;
