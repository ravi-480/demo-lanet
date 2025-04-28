import Notification from "../models/notificationModel";
import Event from "../models/eventModel";
import ApiError from "../utils/ApiError";

interface NotificationData {
  eventId: string;
  senderId: string;
  recipientId?: string;
  message: string;
  type: string;
  metadata: any;
}

/**
 * Creates a notification in the database
 * @param data - Notification data
 * @returns Created notification
 */
export const createNotificationService = async (data: NotificationData) => {
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

/**
 * Marks all notifications as read for a user
 * @param userId - User ID
 */
export const markAllReadService = async (userId: string) => {
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  await Notification.updateMany(
    { userId, status: "unread" },
    { $set: { status: "read" } }
  );

  return { success: true };
};

/**
 * Gets unread notifications for a user
 * @param userId - User ID
 * @returns List of unread notifications
 */
export const getNotificationsForUserService = async (userId: string) => {
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  return await Notification.find({
    userId,
    status: "unread",
  })
    .sort({ createdAt: -1 })
    .limit(20);
};
