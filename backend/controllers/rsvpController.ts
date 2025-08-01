import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as GuestService from "../services/rsvpService";
import ApiError from "../utils/ApiError";
import Guest from "../models/rsvpSchema";
import { validateIdFormat } from "../utils/helper";
import { GetUserByEventIdQuery } from "../Interfaces/rsvp.interface";

/**
 * Add guests from an uploaded Excel file
 */
export const addGuestFromFile = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId } = req.body;
    const file = req.file;

    if (!file) {
      throw new ApiError(400, "File not uploaded");
    }

    if (!validateIdFormat(eventId)) {
      throw new ApiError(400, "Invalid Event ID");
    }

    try {
      const result = await GuestService.processGuestsFromFile(
        eventId,
        file.buffer
      );

      return res.status(201).json({
        success: true,
        message: `Guests added: ${result.newGuestsAdded}, Duplicates skipped: ${result.duplicatesSkipped}`,
        totalGuests: result.totalGuests,
        vendorsUpdated: result.vendorsUpdated,
        additionalCost: result.additionalCost,
      });
    } catch (error: any) {
      // Check if this is our guest limit exceeded error
      if (error.message?.includes("Guest limit exceeded")) {
        throw new ApiError(400, error.message);
      }
      console.log("Error in addGuestFromFile:", error);
      throw new ApiError(500, "Server error processing guest file");
    }
  }
);

// Get guests by event ID with filtering and pagination

export const getUserByEventId = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId } = req.params;

    if (!validateIdFormat(eventId)) {
      throw new ApiError(400, "Invalid Event ID");
    }

    const query: GetUserByEventIdQuery = {
      onlyStats: req.query.onlyStats as string,
      search: req.query.search as string,
      status: req.query.status as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
    };

    try {
      const result = await GuestService.getGuestsByEventId(eventId, query);
      return res.status(200).json(result);
    } catch (error) {
      console.log("Error fetching guests:", error);
      throw new ApiError(500, "Error fetching guests");
    }
  }
);

// Add a single guest manually

export const addSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, name, email, status } = req.body;

    if (!eventId || !name || !email) {
      throw new ApiError(400, "Missing required guest information");
    }

    if (!validateIdFormat(eventId)) {
      throw new ApiError(400, "Invalid Event ID");
    }

    try {
      const result = await GuestService.addSingleGuestToEvent(req.body);

      return res.status(201).json({
        success: true,
        message: "Guest added successfully",
        guest: result.guest,
        vendorsUpdated: result.vendorsUpdated,
        updatedVendors: result.updatedVendors,
        budgetUpdated: result.budgetUpdated,
        additionalCost: result.additionalCost,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(400, error.message);
      }
      throw new ApiError(500, "Server error adding guest");
    }
  }
);

// Remove a single guest

export const removeSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    const { guestId } = req.query;

    if (!validateIdFormat(guestId as string)) {
      throw new ApiError(400, "Invalid Guest ID");
    }

    try {
      const result = await GuestService.removeGuestById(guestId as string);

      if (result.violatingVendors && result.violatingVendors.length > 0) {
        return res.status(200).json({
          success: true,
          message:
            "Guest removed, but vendor budgets were preserved due to minimum guest limit.",
          violatingVendors: result.violatingVendors,
          budgetUpdated: result.budgetUpdated,
          budgetReduction: result.budgetReduction,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Guest removed successfully and vendor prices updated.",
        budgetUpdated: result.budgetUpdated,
        budgetReduction: result.budgetReduction,
      });
    } catch (error) {
      console.log("Error removing guest:", error);
      if (error instanceof Error) {
        throw new ApiError(404, error.message);
      }
      throw new ApiError(500, "Server error removing guest");
    }
  }
);

// Remove all guests or vendors for an event

export const removeAllGuestOrVendor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, query } = req.body;

    if (!id || !query) {
      throw new ApiError(400, "Missing required fields");
    }

    if (!validateIdFormat(id)) {
      throw new ApiError(400, "Invalid ID format");
    }

    if (query !== "guest" && query !== "vendor") {
      throw new ApiError(
        400,
        "Invalid query type. Must be 'guest' or 'vendor'"
      );
    }

    try {
      const result = await GuestService.removeAllByType(id, query);

      if (
        query === "guest" &&
        result.preservedVendors &&
        result.preservedVendors.length > 0
      ) {
        return res.status(200).json({
          success: true,
          message:
            "All guests removed successfully. Some vendor prices were adjusted to minimum guest requirements.",
          preservedVendors: result.preservedVendors,
          budgetUpdated: result.budgetUpdated,
          budgetReduction: result.budgetReduction,
        });
      }

      return res.status(200).json({
        success: true,
        message: `All ${query}s removed successfully`,
        budgetUpdated: result.budgetUpdated,
        budgetReduction: result.budgetReduction,
      });
    } catch (error) {
      console.log(`Error removing all ${query}s:`, error);
      if (error instanceof Error) {
        throw new ApiError(400, error.message);
      }
      throw new ApiError(500, "Server error removing items");
    }
  }
);

// Update guest information

export const updateGuest = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, guestId } = req.params;
  const { name, email, status } = req.body;

  if (!name || !email || !status) {
    throw new ApiError(400, "All fields are required");
  }

  if (!validateIdFormat(eventId) || !validateIdFormat(guestId)) {
    throw new ApiError(400, "Invalid ID format");
  }

  try {
    // Check if email already exists for another guest in this event
    const existingGuest = await Guest.findOne({
      eventId,
      email: email.toLowerCase(),
      _id: { $ne: guestId },
    });

    if (existingGuest) {
      throw new ApiError(
        400,
        "Email already exists for another guest in this event"
      );
    }

    const updatedGuest = await GuestService.updateGuestInfo(eventId, guestId, {
      name,
      email: email.toLowerCase(),
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Guest updated successfully",
      guest: updatedGuest,
    });
  } catch (error) {
    console.log("Error updating guest:", error);
    if (error instanceof Error) {
      throw new ApiError(404, error.message);
    }
    throw new ApiError(500, "Server error updating guest");
  }
});

// Send invitation emails to all guests

export const inviteAllGuest = asyncHandler(
  async (req: Request, res: Response) => {
    const guestData = req.body;

    if (
      !guestData ||
      !Array.isArray(guestData.pendingGuests) ||
      guestData.length === 0
    ) {
      throw new ApiError(400, "No guest data provided");
    }

    const eventId = guestData.pendingGuests[0].eventId;

    if (!validateIdFormat(eventId)) {
      throw new ApiError(400, "Invalid Event ID");
    }

    try {
      const event = await GuestService.getEventById(eventId);
      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      const ans = await GuestService.sendEmailToGuests(guestData.pendingGuests, event);

      return res.status(200).json({
        success: true,
        message: `Invitations sent successfully to ${guestData.length} guests!`,
      });
    } catch (error) {
      console.log("Error sending invitations:", error);
      throw new ApiError(500, "Failed to send invitations");
    }
  }
);

// Validate guest URL for RSVP

export const validateUrl = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, guestId } = req.query;

  if (!eventId || !guestId) {
    throw new ApiError(400, "Missing eventId or guestId");
  }

  if (
    !validateIdFormat(eventId as string) ||
    !validateIdFormat(guestId as string)
  ) {
    throw new ApiError(400, "Invalid eventId or guestId format");
  }

  try {
    const result = await GuestService.validateGuestURL(
      eventId as string,
      guestId as string
    );

    return res.status(200).json({
      success: true,
      guest: result.guest,
    });
  } catch (error) {
    console.log("Error validating URL:", error);
    if (error instanceof Error) {
      throw new ApiError(404, error.message);
    }
    throw new ApiError(500, "Server error validating RSVP URL");
  }
});

// Submit guest response to invitation

export const responseInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const { guestId, eventId, attending } = req.body;

    if (!guestId || !eventId) {
      throw new ApiError(400, "Missing guestId or eventId");
    }

    if (!validateIdFormat(guestId) || !validateIdFormat(eventId)) {
      throw new ApiError(400, "Invalid ID format");
    }

    if (typeof attending !== "boolean") {
      throw new ApiError(400, "Attending status must be a boolean");
    }

    try {
      const result = await GuestService.submitGuestResponse(
        guestId,
        eventId,
        attending
      );

      return res.status(200).json({
        success: true,
        message: `RSVP ${result.status}`,
        status: result.status,
      });
    } catch (error) {
      console.log("Error processing RSVP response:", error);
      if (error instanceof Error) {
        throw new ApiError(404, error.message);
      }
      throw new ApiError(500, "Server error processing RSVP response");
    }
  }
);

// Send reminder email to guest
export const sendReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, name, email, _id: guestId } = req.body;

    if (!eventId || !name || !email || !guestId) {
      throw new ApiError(400, "Missing required guest information");
    }

    if (!validateIdFormat(eventId) || !validateIdFormat(guestId)) {
      throw new ApiError(400, "Invalid ID format");
    }

    try {
      const event = await GuestService.getEventById(eventId);
      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      await GuestService.sendEmailToGuests(
        [{ name, email, _id: guestId }],
        event,
        true // isReminder flag
      );

      return res.status(200).json({
        success: true,
        message: "Reminder email sent successfully",
      });
    } catch (error) {
      console.log("Error sending reminder:", error);
      throw new ApiError(500, "Failed to send reminder");
    }
  }
);
