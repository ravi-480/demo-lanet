import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import Event from "../models/eventModel";
import Notification from "../models/notificationModel";
import ApiError from "../utils/ApiError";
import { getIO } from "../utils/socketUtils";

export const createNewNotification = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { eventId, senderId, recipientId, message, type, metadata } =
        req.body;

      // If no recipientId is provided, we need to find it from the event
      let targetUserId = recipientId;

      if (!targetUserId) {
        const event = await Event.findById(eventId);
        if (!event) {
          throw new ApiError(404, "Event not found");
        }
        targetUserId = event.creator.toString();
      }

      // Create the notification
      const notification = await Notification.create({
        userId: targetUserId,
        eventId,
        type,
        message,
        metadata: {
          ...metadata,
          senderId,
        },
      });

      return res.status(201).json({ success: true, notification });
    } catch (error) {
      console.error("Notification send error:", error);
      throw new ApiError(500, "Internal server error");
    }
  }
);

export const markAllRead = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.body;
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }
    await Notification.updateMany(
      { userId, status: "unread" },
      { $set: { status: "read" } }
    );

    const io = getIO();
    io.to(`user:${userId}`).emit("notifications-marked-read");

    return res.status(200).json({
      status: "success",
      msg: "All notification marked as Read successfully",
    });
  }
);

export const getNotificationForUser = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        throw new ApiError(400, "User Id is required");
      }

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20);

      return res.status(200).json({ success: true, notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new ApiError(500, "Internal server error");
    }
  }
);
