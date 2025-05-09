import mongoose, { Schema } from "mongoose";
import { INotification } from "../Interfaces/notification.interface";

const NotificationSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  eventId: {
    type: String,
    required: true,
    ref: "Event",
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["response", "payment", "reminder", "message", "warning"],
  },
  status: {
    type: String,
    default: "unread",
    enum: ["read", "unread"],
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
