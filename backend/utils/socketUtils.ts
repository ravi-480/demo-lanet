import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import Event from "../models/eventModel";
import Notification from "../models/notificationModel";

let io: SocketIOServer;

export const initializeSocketIP = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("authenticate", (userId: string) => {
      socket.data.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`User authenticated: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
    socket.on("notify-organizer", async (data) => {
      try {
        const { eventId, senderId, type, message, metadata } = data;

        // Ensure event exists
        const event = await Event.findById(eventId);
        if (!event) {
          console.log("Event not found:", eventId);
          return;
        }

        const organizerId = event.creator.toString();

        // Create a new notification
        const notification = await Notification.create({
          userId: organizerId,
          eventId,
          message,
          type,
          metadata: { ...metadata, senderId },
        });

        io.to(`user:${organizerId}`).emit("new-notification", notification);
        socket.emit("notification-sent", { success: true, notification });

        console.log("Notification sent to organizer:", organizerId);
      } catch (error) {
        console.error("Error sending notification:", error);
        socket.emit("notification-sent", {
          success: false,
          error: "Failed to send notification",
        });
      }
    });
  });

  return io;
};

export const getIO = () => io;




