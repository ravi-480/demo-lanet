import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import XLSX from "xlsx";
import Guest from "../models/rsvpSchema";
import mongoose from "mongoose";
import Event from "../models/eventModel";
import { sendEmail } from "../utils/emailService";
import Vendor from "../models/vendorModel";
import { createNotification, formatEmailTemplate } from "../utils/helper";

// Helper functions to reduce repetition

const validateIdFormat = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const addGuestFromFile = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.body;
      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json({ success: false, message: "File not uploaded" });
      }

      if (!validateIdFormat(eventId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Event ID" });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      // Process the Excel file
      const workBook = XLSX.read(file.buffer, { type: "buffer" });
      const sheet = workBook.Sheets[workBook.SheetNames[0]];
      const guests = XLSX.utils.sheet_to_json(sheet);

      if (!Array.isArray(guests) || guests.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No data found in file" });
      }

      // Get existing guests and create a set of emails for quick lookup
      const existingGuests = await Guest.find({ eventId });
      const existingEmails = new Set(
        existingGuests.map((g) => g.email.toLowerCase())
      );

      // Process new guests, skipping duplicates
      const newGuests = [];
      let duplicateCount = 0;

      for (const guest of guests) {
        const guestObj = guest as Record<string, any>;
        const email = (
          (guestObj.email as string) || "nomail@gmail.com"
        ).toLowerCase();

        if (existingEmails.has(email)) {
          duplicateCount++;
        } else {
          newGuests.push({
            name: guestObj.name || "unknown",
            email,
            status: "Pending",
            eventId,
          });
          existingEmails.add(email); // Prevent duplicates within the current upload
        }
      }

      // Bulk insert new guests if any
      if (newGuests.length > 0) {
        await Guest.insertMany(newGuests);
      }

      // Get total guests and calculate if over limit
      const totalGuests = existingGuests.length + newGuests.length;
      const previousGuestCount = event.noOfGuestAdded || 0;
      const guestLimit = event.guestLimit || 0;

      // Calculate guests over limit
      const guestsOverLimit = Math.max(0, totalGuests - guestLimit);

      // This is used for per-plate pricing adjustments
      const previousGuestsOverLimit = Math.max(
        0,
        previousGuestCount - guestLimit
      );
      const newGuestsOverLimit = guestsOverLimit - previousGuestsOverLimit;

      // Update event with total guest count
      await Event.findByIdAndUpdate(eventId, { noOfGuestAdded: totalGuests });

      // Only update per-plate vendors if there are new guests over the limit
      if (newGuestsOverLimit > 0) {
        const vendors = await Vendor.find({
          event: eventId,
          pricingUnit: "per plate",
        });

        if (vendors.length > 0) {
          const vendorUpdates = vendors.map((vendor) => {
            const perPlatePrice =
              (vendor.price || 0) / (vendor.numberOfGuests || 1);

            // Only update pricing for the additional guests over limit
            const newPrice = vendor.price + perPlatePrice * newGuestsOverLimit;
            const newGuestCount = vendor.numberOfGuests + newGuestsOverLimit;

            return Vendor.findByIdAndUpdate(vendor._id, {
              price: newPrice,
              numberOfGuests: newGuestCount,
            });
          });

          await Promise.all(vendorUpdates);
        }
      }

      // Send notification if guest limit exceeded
      if (guestsOverLimit > 0) {
        const message = `Guest limit exceeded by ${guestsOverLimit}. Total: ${totalGuests}, Limit: ${guestLimit}`;

        await createNotification(
          event.creator.toString(),
          eventId,
          message,
          "warning",
          {
            eventTitle: event.name || "Event",
            currentGuestCount: totalGuests,
            guestLimit,
            guestsOverLimit,
          }
        );
      }

      return res.status(201).json({
        success: true,
        message: `Guests added: ${newGuests.length}, Duplicates skipped: ${duplicateCount}`,
        totalGuests,
        ...(guestsOverLimit > 0 && {
          guestsOverLimit,
          newGuestsOverLimit,
        }),
        ...(newGuestsOverLimit > 0 && {
          vendorsUpdated: true,
          pricingUpdatedForGuests: newGuestsOverLimit,
        }),
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

      if (!validateIdFormat(eventId)) {
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

// Add single guest manually
export const addSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const guest = await Guest.create(req.body);

      // Increment guest count in event
      await Event.findByIdAndUpdate(req.body.eventId, {
        $inc: { noOfGuestAdded: 1 },
      });

      return res.status(201).json({
        success: true,
        message: "Guest added Successfully",
        guest,
      });
    } catch (error) {
      console.error("Error adding guest:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export const removeSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { guestId } = req.query;

      if (!validateIdFormat(guestId as string)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Guest ID" });
      }

      const guest = await Guest.findById(guestId);
      if (!guest) {
        return res
          .status(404)
          .json({ success: false, message: "Guest not found" });
      }

      const event = await Event.findById(guest.eventId);
      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Associated event not found" });
      }

      const updatedGuestCount = event.noOfGuestAdded - 1;
      const cateringVendors = await Vendor.find({
        event: guest.eventId,
        pricingUnit: "per plate",
      });

      await Guest.findByIdAndDelete(guestId);
      await Event.findByIdAndUpdate(
        guest.eventId,
        { $inc: { noOfGuestAdded: -1 } },
        { new: true }
      );

      const violatingVendors: any[] = [];

      const updatePromises = cateringVendors.map(async (vendor) => {
        if (vendor.minGuestLimit && updatedGuestCount < vendor.minGuestLimit) {
          // Vendor is violating the min guest requirement
          violatingVendors.push({
            id: vendor._id,
            title: vendor.title,
            minGuestLimit: vendor.minGuestLimit,
          });

          return Vendor.findByIdAndUpdate(
            vendor._id,
            { numberOfGuests: vendor.numberOfGuests }, // preserve original guest count
            { new: true }
          );
        } else {
          const pricePerPlate = vendor.price / vendor.numberOfGuests;
          const newPrice = Math.round(pricePerPlate * updatedGuestCount);

          return Vendor.findByIdAndUpdate(
            vendor._id,
            {
              price: newPrice,
              numberOfGuests: updatedGuestCount,
            },
            { new: true }
          );
        }
      });

      await Promise.all(updatePromises);

      if (violatingVendors.length > 0) {
        return res.status(200).json({
          success: true,
          message:
            "Guest removed, but vendor budgets were preserved due to guest limit.",
          violatingVendors,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Guest removed successfully and vendor prices updated.",
      });
    } catch (error) {
      console.error("Error removing guest:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export const removeAllGuestOrVendor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, query } = req.body;

    if (!id || !query) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    console.log(query);

    if (query === "guest") {
      const cateringVendors = await Vendor.find({
        event: id,
        pricingUnit: "per plate",
        minGuestLimit: { $exists: true, $ne: null },
      });

      // Delete all guests
      await Guest.deleteMany({ eventId: id });
      await Event.findByIdAndUpdate(id, { noOfGuestAdded: 0 });

      // Keep track of vendors with minimum requirements that were preserved
      const preservedVendors = [];

      if (cateringVendors.length > 0) {
        for (const vendor of cateringVendors) {
          // Update the numberOfGuests field but leave price unchanged
          await Vendor.findByIdAndUpdate(vendor._id, { numberOfGuests: 0 });
          preservedVendors.push({
            id: vendor._id,
            title: vendor.title,
            minGuestLimit: vendor.minGuestLimit,
          });
        }

        return res.status(200).json({
          success: true,
          message:
            "All guests removed successfully. Some vendor budgets were preserved due to minimum guest requirements.",
          preservedVendors,
        });
      }

      return res
        .status(200)
        .json({ success: true, message: "All guests removed successfully" });
    }

    if (query === "vendor") {
      await Vendor.deleteMany({ event: id });
      return res
        .status(200)
        .json({ success: true, message: "All vendors removed successfully" });
    }

    return res.status(400).json({ message: "Invalid query type" });
  }
);

export const updateGuest = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.params;
    const { name, email, status } = req.body;

    if (!name || !email || !status) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!validateIdFormat(eventId) || !validateIdFormat(guestId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const updatedGuest = await Guest.findOneAndUpdate(
      { _id: guestId, eventId },
      { name, email, status },
      { new: true }
    );

    if (!updatedGuest) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Guest updated successfully",
      guest: updatedGuest,
    });
  } catch (error) {
    console.error("Error updating guest:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Send invitation emails to all guests
export const inviteAllGuest = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const guestData = req.body;
      if (!guestData || !Array.isArray(guestData) || guestData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No guest data provided",
        });
      }

      const eventId = guestData[0].eventId;

      if (!validateIdFormat(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Event ID",
        });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Send emails in batches to avoid overwhelming the email service
      const batchSize = 10;
      const emailPromises = [];

      for (let i = 0; i < guestData.length; i += batchSize) {
        const batch = guestData.slice(i, i + batchSize);

        const batchPromises = batch.map((guest) =>
          sendEmail({
            to: guest.email,
            subject: `Invitation: ${event.name} - ${
              event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
            }`,
            text: "",
            html: formatEmailTemplate(event, guest),
          })
        );

        emailPromises.push(Promise.all(batchPromises));

        if (i + batchSize < guestData.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      await Promise.all(emailPromises.flat());

      return res.status(200).json({
        success: true,
        message: `Invitations sent successfully to ${guestData.length} guests!`,
      });
    } catch (error) {
      console.error("Error sending invitations:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send invitations",
      });
    }
  }
);

export const validateUrl = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.query;

    if (!eventId || !guestId) {
      return res.status(400).json({
        success: false,
        message: "Missing eventId or guestId",
      });
    }

    if (
      !validateIdFormat(eventId as string) ||
      !validateIdFormat(guestId as string)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid eventId or guestId format",
      });
    }

    // Fetch both event and guest in parallel
    const [event, guest] = await Promise.all([
      Event.findById(eventId),
      Guest.findById(guestId),
    ]);

    if (!event || !guest) {
      return res.status(404).json({
        success: false,
        message: "Invalid RSVP link",
      });
    }

    return res.status(200).json({
      success: true,
      guest: {
        name: guest.name,
        email: guest.email,
        date: event.date,
        location: event.location,
        responseStatus: guest.status,
      },
    });
  } catch (error) {
    console.error("Error validating URL:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Submit guest response
export const responseInvite = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { guestId, eventId, attending } = req.body;

      if (!guestId || !eventId) {
        return res.status(400).json({
          success: false,
          message: "Missing guestId or eventId",
        });
      }

      const guest = await Guest.findById(guestId);
      if (!guest) {
        return res.status(404).json({
          success: false,
          message: "Guest not found",
        });
      }

      // Update guest status
      const previousStatus = guest.status;
      guest.status = attending ? "Confirmed" : "Declined";
      await guest.save();

      // Get the event and create notification in parallel
      const event = await Event.findById(eventId);
      if (event) {
        const organizerId = event.creator.toString();
        const message = `${guest.name} has ${
          attending ? "accepted" : "declined"
        } your invitation to ${event.name || "your event"}.`;

        await createNotification(organizerId, eventId, message, "response", {
          guestId: guest._id.toString(),
          guestName: guest.name,
          response: guest.status,
          previousStatus,
          eventTitle: event.name || "Event",
        });
      }

      return res.status(200).json({
        success: true,
        message: `RSVP ${guest.status}`,
      });
    } catch (error) {
      console.error("Error processing RSVP response:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Send reminder email to guest
export const sendReminder = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId, name, email, _id: guestId } = req.body;

      if (!validateIdFormat(eventId) || !validateIdFormat(guestId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      await sendEmail({
        to: email,
        subject: `Reminder: ${event.name} - ${
          event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
        }`,
        text: "",
        html: formatEmailTemplate(event, { name, email, _id: guestId }, true),
      });

      return res.status(200).json({
        success: true,
        message: "Reminder email sent successfully",
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send reminder",
      });
    }
  }
);
