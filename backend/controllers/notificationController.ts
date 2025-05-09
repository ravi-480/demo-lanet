import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import Event from "../models/eventModel";
import Notification from "../models/notificationModel";
import ApiError from "../utils/ApiError";
import { getIO } from "../utils/socketUtils";
import {
  CreateNotificationDto,
  MarkNotificationsDto,
  NotificationResponseDto,
} from "../Interfaces/notification.interface";

export const createNewNotification = asyncHandler(
  async (
    req: Request<{}, {}, CreateNotificationDto>,
    res: Response<NotificationResponseDto>
  ): Promise<any> => {
    const { eventId, senderId, recipientId, message, type, metadata } =
      req.body;

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
  }
);

export const markAllRead = asyncHandler(
  async (
    req: Request<{}, {}, MarkNotificationsDto>,
    res: Response<NotificationResponseDto>
  ): Promise<any> => {
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
      success: true,
      message: "All notification marked as Read successfully",
    });
  }
);

export const getNotificationForUser = asyncHandler(
  async (
    req: Request,
    res: Response<NotificationResponseDto>
  ): Promise<any> => {
    const userId = req.query.userId as string;

    if (!userId) {
      throw new ApiError(400, "User Id is required");
    }

    const notifications = await Notification.find({
      userId,
      status: "unread",
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ success: true, notifications });
  }
);
