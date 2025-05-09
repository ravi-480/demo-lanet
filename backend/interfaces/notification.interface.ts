import { Document } from "mongoose";

export type NotificationType = string;
export type NotificationStatus = "read" | "unread";

// Notification Document Interface (extends the MongoDB Document)
export interface INotification extends Document {
  userId: string;
  eventId: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Request DTO for creating notification
export interface CreateNotificationDto {
  eventId: string;
  senderId: string;
  recipientId?: string;
  message: string;
  type: string;
  metadata: Record<string, any>;
}

// Response DTO for notification
export interface NotificationResponseDto {
  success: boolean;
  notification?: INotification;
  notifications?: INotification[];
  message?: string;
}

// Service layer data interface
export interface NotificationServiceData {
  eventId: string;
  senderId: string;
  recipientId?: string;
  message: string;
  type: string;
  metadata: Record<string, any>;
}

// For marking notifications as read
export interface MarkNotificationsDto {
  userId: string;
}

// For querying notifications
export interface GetNotificationsQueryDto {
  userId: string;
  limit?: number;
  status?: NotificationStatus;
}

// Constants for notification types (for reference)
export const NOTIFICATION_TYPES = {
  RESPONSE: "response",
  PAYMENT: "payment",
  REMINDER: "reminder",
  MESSAGE: "message",
  WARNING: "warning",
};
