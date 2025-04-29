import { getIO } from "./socketUtils";
import { createNotificationService } from "../services/notificationService";

export const createNotification = async (
  userId: string,
  eventId: string,
  message: string,
  type: string,
  metadata: any
) => {
  const notification = await createNotificationService({
    eventId,
    senderId: metadata.senderId || "",
    recipientId: userId,
    message,
    type,
    metadata,
  });

  // Emit real-time notification via socket
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit("new-notification", notification);
  }

  return notification;
};

export const formatEmailTemplate = (
  event: any,
  guest: any,
  isReminder = false
) => {
  const {
    name: eventName,
    date,
    location,
    description,
    eventType,
    _id: eventId,
  } = event;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const capitalizedEventType =
    eventType.charAt(0).toUpperCase() + eventType.slice(1);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>${isReminder ? "We Miss Your RSVP!" : "You're Invited!"}</h2>
      <h3>${eventName} - ${capitalizedEventType}</h3>
      
      <p>Hello ${guest.name || "there"},</p>
      
      <p>${
        isReminder
          ? "This is a friendly reminder to RSVP for our upcoming"
          : "You are cordially invited to attend our"
      } ${eventType} event.</p>
      
      <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Details:</strong> ${description}</p>
      </div>
      
      <p>${
        isReminder
          ? "Please response by clicking the button below:"
          : "Please let us know if you can attend by clicking the button below:"
      }</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/rsvp/respond?eventId=${eventId}&guestId=${
    guest._id
  }"
          style="background-color: ${
            isReminder ? "#f97316" : "#0ea5e9"
          }; padding: 12px 25px; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          ${isReminder ? "RSVP Now" : "Respond to Invitation"}
        </a>
      </div>
      
      <p>${
        isReminder
          ? "We hope to hear from you soon!"
          : "We look forward to celebrating with you!"
      }</p>
    </div>
  `;
};
