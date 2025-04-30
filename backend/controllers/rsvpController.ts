import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import XLSX from "xlsx";
import Guest from "../models/rsvpSchema";
import mongoose from "mongoose";
import Event from "../models/eventModel";
import { sendEmail } from "../utils/emailService";
import Vendor from "../models/vendorModel";
import { createNotification, formatEmailTemplate } from "../utils/helper";

// Reusable validation function
const validateIdFormat = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Reusable error response function
const sendErrorResponse = (res: Response, status: number, message: string) => {
  return res.status(status).json({ success: false, message });
};

// Reusable function to get event by ID
const getEventById = async (eventId: string) => {
  return await Event.findById(eventId);
};

// Reusable function to handle vendor price updates for guest count changes
const updateVendorPrices = async (
  eventId: string,
  guestCountChange: number,
  currentGuestCount: number
) => {
  const vendors = await Vendor.find({
    event: eventId,
    pricingUnit: "per plate",
  });

  let totalCostChange = 0;
  const updatedVendors = [];
  const violatingVendors = [];

  for (const vendor of vendors) {
    const perPlatePrice = vendor.price / vendor.numberOfGuests;

    // For removing guests (negative guestCountChange)
    if (
      guestCountChange < 0 &&
      vendor.minGuestLimit &&
      currentGuestCount < vendor.minGuestLimit
    ) {
      violatingVendors.push({
        id: vendor._id,
        title: vendor.title,
        minGuestLimit: vendor.minGuestLimit,
      });

      continue; // Skip price update for this vendor
    }

    // Calculate new price
    const priceChange = perPlatePrice * guestCountChange;
    const newPrice = Math.max(0, vendor.price + priceChange);
    const newGuestCount = Math.max(0, vendor.numberOfGuests + guestCountChange);

    // Update vendor
    await Vendor.findByIdAndUpdate(vendor._id, {
      price: newPrice,
      numberOfGuests: newGuestCount,
    });

    totalCostChange += priceChange;

    updatedVendors.push({
      id: vendor._id,
      title: vendor.title,
      priceChange,
      newPrice,
    });
  }

  return {
    totalCostChange,
    updatedVendors,
    violatingVendors,
  };
};

// Reusable function to update event budget
const updateEventBudget = async (eventId: string, costChange: number) => {
  if (costChange === 0) return;

  const event = await getEventById(eventId);
  if (!event) return;

  const currentBudgetSpent = event.budget?.spent || 0;
  const newBudgetSpent = Math.max(0, currentBudgetSpent + costChange);

  await Event.findByIdAndUpdate(
    eventId,
    { "budget.spent": newBudgetSpent },
    { new: true }
  );

  return newBudgetSpent;
};

// Reusable function to check and notify if guest limit is exceeded
const checkGuestLimitExceeded = async (
  event: any,
  currentGuestCount: number
) => {
  const guestLimit = event.guestLimit || 0;

  if (guestLimit > 0 && currentGuestCount > guestLimit) {
    const guestsOverLimit = currentGuestCount - guestLimit;

    await createNotification(
      event.creator.toString(),
      event._id.toString(),
      `Guest limit exceeded by ${guestsOverLimit}. Total: ${currentGuestCount}, Limit: ${guestLimit}`,
      "warning",
      {
        eventTitle: event.name || "Event",
        currentGuestCount,
        guestLimit,
        guestsOverLimit,
      }
    );

    return {
      guestLimitExceeded: true,
      guestsOverLimit,
    };
  }

  return {
    guestLimitExceeded: false,
    guestsOverLimit: 0,
  };
};

export const addGuestFromFile = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.body;
      const file = req.file;

      if (!file) {
        return sendErrorResponse(res, 400, "File not uploaded");
      }

      if (!validateIdFormat(eventId)) {
        return sendErrorResponse(res, 400, "Invalid Event ID");
      }

      const event = await getEventById(eventId);
      if (!event) {
        return sendErrorResponse(res, 404, "Event not found");
      }

      // Process the Excel file
      const workBook = XLSX.read(file.buffer, { type: "buffer" });
      const sheet = workBook.Sheets[workBook.SheetNames[0]];
      const guests = XLSX.utils.sheet_to_json(sheet);

      if (!Array.isArray(guests) || guests.length === 0) {
        return sendErrorResponse(res, 400, "No data found in file");
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
      console.log({
        previousGuestCount,
        guestLimit,
        totalGuests,
        guestsOverLimit,
        previousGuestsOverLimit,
        newGuestsOverLimit,
      });

      // Only update vendors if there are new guests over the limit
      let totalAdditionalCost = 0;
      let vendorsUpdated = [];

      if (newGuestsOverLimit > 0) {
        const vendorResult = await updateVendorPrices(
          eventId,
          newGuestsOverLimit,
          totalGuests
        );

        totalAdditionalCost = vendorResult.totalCostChange;
        vendorsUpdated = vendorResult.updatedVendors;
      }

      // Update event with total guest count and budget spent
      const updateData: any = { noOfGuestAdded: totalGuests };

      // Only update budget if there's an additional cost
      if (totalAdditionalCost > 0) {
        await updateEventBudget(eventId, totalAdditionalCost);
      }

      await Event.findByIdAndUpdate(eventId, updateData);

      // Send notification if guest limit exceeded
      if (guestsOverLimit > 0) {
        await checkGuestLimitExceeded(event, totalGuests);
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
          vendorsUpdated: vendorsUpdated.length > 0,
          pricingUpdatedForGuests: newGuestsOverLimit,
          budgetUpdated: totalAdditionalCost > 0,
          additionalCost: totalAdditionalCost,
        }),
      });
    } catch (error) {
      console.error("Error in addGuestFromFile:", error);
      return sendErrorResponse(res, 500, "Server error");
    }
  }
);

// Get Guests by Event ID
export const getUserByEventId = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;

      if (!validateIdFormat(eventId)) {
        return sendErrorResponse(res, 400, "Invalid Event ID");
      }

      const rsvpList = await Guest.find({ eventId });

      if (!rsvpList || rsvpList.length === 0) {
        return sendErrorResponse(res, 404, "No guests found");
      }

      return res.status(200).json({
        success: true,
        message: "Guests fetched successfully",
        rsvpList,
      });
    } catch (error) {
      console.error("Error in getUserByEventId:", error);
      return sendErrorResponse(res, 500, "Server error");
    }
  }
);

// Add single guest manually
export const addSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.body;

      if (!validateIdFormat(eventId)) {
        return sendErrorResponse(res, 400, "Invalid Event ID");
      }

      console.log(req.body);

      const existingGuest = await Guest.findOne({
        eventId,
        email: req.body.email,
      });

      if (existingGuest) {
        return sendErrorResponse(
          res,
          400,
          "A guest with this email is already added to the event."
        );
      }

      // Get event details first
      const event = await getEventById(eventId);
      if (!event) {
        return sendErrorResponse(res, 404, "Event not found");
      }

      const currentGuestCount = event.noOfGuestAdded || 0;
      const newGuestCount = currentGuestCount + 1;

      // Create the guest
      const guest = await Guest.create(req.body);

      // Update event guest count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { noOfGuestAdded: 1 },
      });

      // Update vendor prices for the new guest
      const { totalCostChange, updatedVendors } = await updateVendorPrices(
        eventId,
        1,
        newGuestCount
      );

      // Update event budget spent if there's additional cost
      if (totalCostChange > 0) {
        await updateEventBudget(eventId, totalCostChange);
      }

      // Check if guest limit is exceeded
      const { guestLimitExceeded } = await checkGuestLimitExceeded(
        event,
        newGuestCount
      );

      return res.status(201).json({
        success: true,
        message: "Guest added successfully",
        guest,
        vendorsUpdated: updatedVendors.length > 0,
        updatedVendors: updatedVendors.length > 0 ? updatedVendors : undefined,
        budgetUpdated: totalCostChange > 0,
        additionalCost: totalCostChange,
        guestLimitExceeded,
      });
    } catch (error) {
      console.error("Error adding guest:", error);
      return sendErrorResponse(res, 500, "Server error");
    }
  }
);

export const removeSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { guestId } = req.query;

      if (!validateIdFormat(guestId as string)) {
        return sendErrorResponse(res, 400, "Invalid Guest ID");
      }

      const guest = await Guest.findById(guestId);
      if (!guest) {
        return sendErrorResponse(res, 404, "Guest not found");
      }

      const event = await getEventById(guest.eventId);
      if (!event) {
        return sendErrorResponse(res, 404, "Associated event not found");
      }

      const updatedGuestCount = event.noOfGuestAdded - 1;

      // Remove guest first
      await Guest.findByIdAndDelete(guestId);
      await Event.findByIdAndUpdate(
        guest.eventId,
        { $inc: { noOfGuestAdded: -1 } },
        { new: true }
      );

      // Update vendor prices
      const { totalCostChange, updatedVendors, violatingVendors } =
        await updateVendorPrices(guest.eventId, -1, updatedGuestCount);

      // Update the event's budget if there was a price reduction
      if (totalCostChange < 0) {
        await updateEventBudget(guest.eventId, totalCostChange);
      }

      if (violatingVendors.length > 0) {
        return res.status(200).json({
          success: true,
          message:
            "Guest removed, but vendor budgets were preserved due to minimum guest limit.",
          violatingVendors,
          budgetUpdated: totalCostChange < 0,
          budgetReduction: Math.abs(totalCostChange),
        });
      }

      return res.status(200).json({
        success: true,
        message: "Guest removed successfully and vendor prices updated.",
        budgetUpdated: totalCostChange < 0,
        budgetReduction: Math.abs(totalCostChange),
      });
    } catch (error) {
      console.error("Error removing guest:", error);
      return sendErrorResponse(res, 500, "Server error");
    }
  }
);

export const removeAllGuestOrVendor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, query } = req.body;

    if (!id || !query) {
      return sendErrorResponse(res, 400, "Missing required fields");
    }
    console.log(query);

    if (query === "guest") {
      // Get event details first
      const event = await getEventById(id);
      if (!event) {
        return sendErrorResponse(res, 404, "Event not found");
      }

      const originalGuestCount = event.noOfGuestAdded || 0;

      // Get all catering vendors
      const allCateringVendors = await Vendor.find({
        event: id,
        pricingUnit: "per plate",
      });

      // Track budget reduction from vendor price updates
      let totalBudgetReduction = 0;
      const preservedVendors = [];

      // Process all vendors
      for (const vendor of allCateringVendors) {
        const minGuestLimit = vendor.minGuestLimit || 0;

        if (minGuestLimit > 0) {
          // We need to respect the minimum guest limit
          // Calculate price per plate
          const pricePerPlate = vendor.price / vendor.numberOfGuests;

          // Calculate new guest count - either minGuestLimit or keep at 0
          const newGuestCount = minGuestLimit;

          // Calculate price reduction
          const priceReduction =
            pricePerPlate * (vendor.numberOfGuests - newGuestCount);
          totalBudgetReduction += priceReduction;

          // Update vendor to minGuestLimit instead of 0
          await Vendor.findByIdAndUpdate(vendor._id, {
            numberOfGuests: newGuestCount,
            price: vendor.price - priceReduction,
          });

          preservedVendors.push({
            id: vendor._id,
            title: vendor.title,
            minGuestLimit,
            adjustedPrice: vendor.price - priceReduction,
          });
        } else {
          // No minimum guest limit, reduce price to 0
          totalBudgetReduction += vendor.price;
          await Vendor.findByIdAndUpdate(vendor._id, {
            numberOfGuests: 0,
            price: 0,
          });
        }
      }

      // Delete all guests
      await Guest.deleteMany({ eventId: id });
      await Event.findByIdAndUpdate(id, { noOfGuestAdded: 0 });

      // Update the event's budget
      if (totalBudgetReduction > 0) {
        await updateEventBudget(id, -totalBudgetReduction);
      }

      if (preservedVendors.length > 0) {
        return res.status(200).json({
          success: true,
          message:
            "All guests removed successfully. Some vendor prices were adjusted to minimum guest requirements.",
          preservedVendors,
          budgetUpdated: totalBudgetReduction > 0,
          budgetReduction: totalBudgetReduction,
        });
      }

      return res.status(200).json({
        success: true,
        message: "All guests removed successfully",
        budgetUpdated: totalBudgetReduction > 0,
        budgetReduction: totalBudgetReduction,
      });
    }

    if (query === "vendor") {
      // Get event details first
      const event = await getEventById(id);
      if (!event) {
        return sendErrorResponse(res, 404, "Event not found");
      }

      // Get the total vendor costs before deletion
      const vendors = await Vendor.find({ event: id });
      const totalVendorCost = vendors.reduce(
        (sum, vendor) => sum + (vendor.price || 0),
        0
      );

      // Delete all vendors
      await Vendor.deleteMany({ event: id });

      // Update the event's budget
      if (totalVendorCost > 0) {
        await updateEventBudget(id, -totalVendorCost);
      }

      return res.status(200).json({
        success: true,
        message: "All vendors removed successfully",
        budgetUpdated: totalVendorCost > 0,
        budgetReduction: totalVendorCost,
      });
    }

    return sendErrorResponse(res, 400, "Invalid query type");
  }
);

export const updateGuest = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.params;
    const { name, email, status } = req.body;

    if (!name || !email || !status) {
      return sendErrorResponse(res, 400, "All fields are required");
    }

    if (!validateIdFormat(eventId) || !validateIdFormat(guestId)) {
      return sendErrorResponse(res, 400, "Invalid ID format");
    }

    const updatedGuest = await Guest.findOneAndUpdate(
      { _id: guestId, eventId },
      { name, email, status },
      { new: true }
    );

    if (!updatedGuest) {
      return sendErrorResponse(res, 404, "Guest not found");
    }

    return res.status(200).json({
      success: true,
      message: "Guest updated successfully",
      guest: updatedGuest,
    });
  } catch (error) {
    console.error("Error updating guest:", error);
    return sendErrorResponse(res, 500, "Server error");
  }
});

// Reusable function to send emails to guests
const sendEmailToGuests = async (
  guests: any[],
  event: any,
  isReminder = false
) => {
  // Send emails in batches to avoid overwhelming the email service
  const batchSize = 10;
  const emailPromises = [];

  for (let i = 0; i < guests.length; i += batchSize) {
    const batch = guests.slice(i, i + batchSize);

    const batchPromises = batch.map((guest) =>
      sendEmail({
        to: guest.email,
        subject: `${isReminder ? "Reminder" : "Invitation"}: ${event.name} - ${
          event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
        }`,
        text: "",
        html: formatEmailTemplate(event, guest, isReminder),
      })
    );

    emailPromises.push(Promise.all(batchPromises));

    if (i + batchSize < guests.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return Promise.all(emailPromises.flat());
};

// Send invitation emails to all guests
export const inviteAllGuest = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const guestData = req.body;
      if (!guestData || !Array.isArray(guestData) || guestData.length === 0) {
        return sendErrorResponse(res, 400, "No guest data provided");
      }

      const eventId = guestData[0].eventId;

      if (!validateIdFormat(eventId)) {
        return sendErrorResponse(res, 400, "Invalid Event ID");
      }

      const event = await getEventById(eventId);
      if (!event) {
        return sendErrorResponse(res, 404, "Event not found");
      }

      await sendEmailToGuests(guestData, event);

      return res.status(200).json({
        success: true,
        message: `Invitations sent successfully to ${guestData.length} guests!`,
      });
    } catch (error) {
      console.error("Error sending invitations:", error);
      return sendErrorResponse(res, 500, "Failed to send invitations");
    }
  }
);

export const validateUrl = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.query;

    if (!eventId || !guestId) {
      return sendErrorResponse(res, 400, "Missing eventId or guestId");
    }

    if (
      !validateIdFormat(eventId as string) ||
      !validateIdFormat(guestId as string)
    ) {
      return sendErrorResponse(res, 400, "Invalid eventId or guestId format");
    }

    // Fetch both event and guest in parallel
    const [event, guest] = await Promise.all([
      getEventById(eventId as string),
      Guest.findById(guestId),
    ]);

    if (!event || !guest) {
      return sendErrorResponse(res, 404, "Invalid RSVP link");
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
    return sendErrorResponse(res, 500, "Server error");
  }
});

// Submit guest response
export const responseInvite = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { guestId, eventId, attending } = req.body;

      if (!guestId || !eventId) {
        return sendErrorResponse(res, 400, "Missing guestId or eventId");
      }

      const guest = await Guest.findById(guestId);
      if (!guest) {
        return sendErrorResponse(res, 404, "Guest not found");
      }

      // Update guest status
      const previousStatus = guest.status;
      guest.status = attending ? "Confirmed" : "Declined";
      await guest.save();

      // Get the event and create notification in parallel
      const event = await getEventById(eventId);
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
      return sendErrorResponse(res, 500, "Server error");
    }
  }
);

// Send reminder email to guest
export const sendReminder = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId, name, email, _id: guestId } = req.body;

      if (!validateIdFormat(eventId) || !validateIdFormat(guestId)) {
        return sendErrorResponse(res, 400, "Invalid ID format");
      }

      const event = await getEventById(eventId);
      if (!event) {
        return sendErrorResponse(res, 404, "Event not found");
      }

      await sendEmailToGuests([{ name, email, _id: guestId }], event, true);

      return res.status(200).json({
        success: true,
        message: "Reminder email sent successfully",
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      return sendErrorResponse(res, 500, "Failed to send reminder");
    }
  }
);

// rzp_test_3OMXA29PCRFzqg
// pCERZadzAzch9vuHlfHNaB1L
