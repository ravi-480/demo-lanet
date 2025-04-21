import { Router } from "express";
import {
  createNewNotification,
  markAllRead,
  getNotificationForUser,
} from "../controllers/notificationController";
const router = Router();

// Create a new notification
router.post("/", createNewNotification);

// Get notifications for a user
router.get("/", getNotificationForUser);

// mark all as read

router.patch("/mark-all-read", markAllRead);

export default router;
