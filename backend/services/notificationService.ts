import Notification from "../models/notificationModel";
import Event from "../models/eventModel";
import ApiError from "../utils/ApiError";
import { INotification, NotificationServiceData } from "../Interfaces/notification.interface";

export const createNotificationService = async (
  data: NotificationServiceData
): Promise<INotification> => {
  const { eventId, senderId, recipientId, message, type, metadata } = data;

  let targetUserId = recipientId;

  // If no recipientId is provided, get the event creator as the recipient
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
    status: "unread",
    metadata: {
      ...metadata,
      senderId,
    },
  });

  return notification;
};

export const markAllReadService = async (
  userId: string
): Promise<{ success: boolean }> => {
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  await Notification.updateMany(
    { userId, status: "unread" },
    { $set: { status: "read" } }
  );

  return { success: true };
};

export const getNotificationsForUserService = async (
  userId: string,
  limit: number = 20
): Promise<INotification[]> => {
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  return await Notification.find({
    userId,
    status: "unread",
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};
