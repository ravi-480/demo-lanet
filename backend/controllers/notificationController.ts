import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHandler";
import { getIO } from "../utils/socketUtils";
import {
  createNotificationService,
  markAllReadService,
  getNotificationsForUserService,
} from "../services/notificationService";

export const createNewNotification = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const notification = await createNotificationService(req.body);

    // Emit socket event for real-time update
    const io = getIO();
    if (io) {
      io.to(`user:${notification.userId}`).emit(
        "new-notification",
        notification
      );
    }

    return sendResponse(res, 201, true, "Notification created successfully", {
      notification,
    });
  }
);

export const markAllRead = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.body;

    await markAllReadService(userId);

    // Emit socket event for real-time update
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit("notifications-marked-read");
    }

    return sendResponse(
      res,
      200,
      true,
      "All notifications marked as Read successfully",
      null
    );
  }
);

export const getNotificationForUser = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = req.query.userId as string;

    const notifications = await getNotificationsForUserService(userId);

    return sendResponse(res, 200, true, "Notifications fetched successfully", {
      notifications,
    });
  }
);
