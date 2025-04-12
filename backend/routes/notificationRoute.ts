import { Router, Request, Response } from "express";
import Event from "../models/eventModel";
import Notification from "../models/notificationModel";
import { getIO } from "../utils/socketUtils";
const router = Router();

// Create a new notification
router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { eventId, senderId, recipientId, message, type, metadata } =
      req.body;

    // If no recipientId is provided, we need to find it from the event
    let targetUserId = recipientId;

    if (!targetUserId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
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
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get notifications for a user
router.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// mark all as read

router.patch(
  "/mark-all-read",
  async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
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

export default router;



