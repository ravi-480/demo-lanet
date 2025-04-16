import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import XLSX from "xlsx";
import Guest from "../models/rsvpSchema";
import mongoose from "mongoose";
import Event from "../models/eventModel";
import { sendEmail } from "../utils/emailService";

// Upload Guests from Excel File
export const addGuestFromFile = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Event ID" });
      }

      const file = req.file;
      if (!file) {
        return res
          .status(400)
          .json({ success: false, message: "File not uploaded" });
      }

      const workBook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workBook.SheetNames[0];
      const sheet = workBook.Sheets[sheetName];
      const guests = XLSX.utils.sheet_to_json(sheet);

      if (!Array.isArray(guests) || guests.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No data found in file" });
      }

      const guestsWithEvent = guests.map((guest: any) => ({
        name: guest.name || "unknown",
        email: guest.email || "nomail@gmail.com",
        status: "Pending",
        eventId: new mongoose.Types.ObjectId(eventId),
      }));

      await Guest.insertMany(guestsWithEvent);

      return res.status(201).json({
        success: true,
        message: "Guests added successfully",
        count: guestsWithEvent.length,
      });
    } catch (error) {
      console.error("Error in addGuestFromFile:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Get Guests by Event ID
export const getUserByEventId = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Event ID" });
      }

      const rsvpList = await Guest.find({ eventId });

      if (!rsvpList || rsvpList.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No guests found" });
      }

      return res.status(200).json({
        success: true,
        message: "Guests fetched successfully",
        rsvpList,
      });
    } catch (error) {
      console.error("Error in getUserByEventId:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// add single guest manually

export const addSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body;

    await Guest.create(data);
    return res
      .status(201)
      .json({ success: true, message: "Guest added Successfully" });
  }
);

export const removeSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    const { guestId } = req.query;

    await Guest.findByIdAndDelete(guestId);

    return res
      .status(200)
      .json({ success: true, message: "Guest removed successfully" });
  }
);



export const updateGuest = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.params;
    const { name, email, status } = req.body;

    if (!name || !email || !status) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find and update the guest
    const updatedGuest = await Guest.findOneAndUpdate(
      { _id: guestId, eventId },
      { name, email, status },
      { new: true }
    );

    if (!updatedGuest) {
      return res.status(404).json({ message: "Guest not found." });
    }

    return res.status(200).json(updatedGuest);
  } catch (error) {
    console.error("Error updating guest:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

//send invite mail to all guest

export const inviteAllGuest = asyncHandler(
  async (req: Request, res: Response) => {
    const guestData = req.body;
    const eventId = guestData[0].eventId;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    console.log(event);

    try {
      // Extract the event details for the email
      const { name, date, location, description, eventType } = event;
      console.log(eventType);

      // Format the date for display
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Send invitation emails to all guests
      for (const guest of guestData) {
        await sendEmail({
          to: guest.email,
          subject: `Invitation: ${name} - ${
            eventType.charAt(0).toUpperCase() + eventType.slice(1)
          }`,
          text: "",
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>You're Invited!</h2>
                <h3>${name} - ${
            eventType.charAt(0).toUpperCase() + eventType.slice(1)
          }</h3>
                
                <p>Hello ${guest.name || "there"},</p>
                
                <p>You are cordially invited to attend our ${eventType} event.</p>
                
                <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Location:</strong> ${location}</p>
                  <p><strong>Details:</strong> ${description}</p>
                </div>
                
                <p>Please let us know if you can attend by clicking the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:3000/rsvp/respond?eventId=${eventId}&guestId=${
            guest._id
          }"
                    style="background-color: #0ea5e9; padding: 12px 25px; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Respond to Invitation
                  </a>
                </div>
                
                <p>We look forward to celebrating with you!</p>
              </div>
            `,
        });
      }

      res.status(200).json({
        success: true,
        message: "Invitations sent successfully to all guests!",
      });
    } catch (error) {
      console.error("Error sending invitations:", error);
      res.status(500).json({ message: "Failed to send invitations." });
    }
  }
);

export const validateUrl = asyncHandler(async (req, res) => {
  const { eventId, guestId } = req.query;
  console.log(eventId, guestId);

  if (!eventId || !guestId) {
    return res.status(400).json({ message: "Missing eventId or guestId" });
  }

  if (
    !mongoose.Types.ObjectId.isValid(eventId as string) ||
    !mongoose.Types.ObjectId.isValid(guestId as string)
  ) {
    return res.status(400).json({ message: "Invalid eventId or guestId" });
  }

  const event = await Event.findById(eventId);
  const guest = await Guest.findById(guestId);

  if (!event || !guest) {
    return res.status(404).json({ message: "Invalid RSVP link" });
  }

  return res.status(200).json({
    guest: {
      name: guest.name,
      email: guest.email,
      date: event.date,
      location: event.location,
      responseStatus: guest.status,
    },
  });
});


// submit guest response 
export const responseInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const { guestId, eventId, attending } = req.body;

    if (!guestId || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid guestId, eventId, or status",
      });
    }

    const guest = await Guest.findById(guestId);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }
    console.log(req.body);

    guest.status = attending ? "Confirmed" : "Declined";
    await guest.save();

    return res.status(200).json({
      success: true,
      message: `RSVP ${guest.status}`,
      guest: {
        id: guest._id,
        name: guest.name,
        email: guest.email,
        status: guest.status,
      },
    });
  }
);

// send reminder mail to guest

export const sendReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, name, email, _id: guestId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    try {
      const { name: eventName, date, location, description, eventType } = event;

      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      await sendEmail({
        to: email,
        subject: `Reminder: ${eventName} - ${
          eventType.charAt(0).toUpperCase() + eventType.slice(1)
        }`,
        text: "",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>We Miss Your RSVP!</h2>
            <h3>${eventName} - ${
          eventType.charAt(0).toUpperCase() + eventType.slice(1)
        }</h3>
            
            <p>Hello ${name || "there"},</p>
            <p>This is a friendly reminder to RSVP for our upcoming ${eventType} event.</p>
            
            <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Location:</strong> ${location}</p>
              <p><strong>Details:</strong> ${description}</p>
            </div>
            
            <p>Please respond by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/rsvp/respond?eventId=${eventId}&guestId=${guestId}"
                style="background-color: #f97316; padding: 12px 25px; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                RSVP Now
              </a>
            </div>
            
            <p>We hope to hear from you soon!</p>
          </div>
        `,
      });

      res.status(200).json({
        success: true,
        message: "Reminder email sent successfully.",
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ message: "Failed to send reminder." });
    }
  }
);
