import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as GuestService from "../services/rsvpService";

// Reusable error response function
const sendErrorResponse = (res: Response, status: number, message: string) => {
  return res.status(status).json({ success: false, message });
};

export const addGuestFromFile = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.body;
      const file = req.file;

      if (!file) {
        return sendErrorResponse(res, 400, "File not uploaded");
      }

      if (!GuestService.validateIdFormat(eventId)) {
        return sendErrorResponse(res, 400, "Invalid Event ID");
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
        });
      } catch (error: any) {
        // Check if this is our guest limit exceeded error
        if (error.message && error.message.includes("Guest limit exceeded")) {
          return sendErrorResponse(res, 400, error.message);
        }
        // Re-throw for the outer catch block to handle
        throw error;
      }
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

      if (!GuestService.validateIdFormat(eventId)) {
        return sendErrorResponse(res, 400, "Invalid Event ID");
      }

      const rsvpList = await GuestService.getGuestsByEventId(eventId);

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

      if (!GuestService.validateIdFormat(eventId)) {
        return sendErrorResponse(res, 400, "Invalid Event ID");
      }

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
      console.error("Error adding guest:", error);
      if (error instanceof Error) {
        return sendErrorResponse(res, 400, error.message);
      }
      return sendErrorResponse(res, 500, "Server error");
    }
  }
);

export const removeSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { guestId } = req.query;

      if (!GuestService.validateIdFormat(guestId as string)) {
        return sendErrorResponse(res, 400, "Invalid Guest ID");
      }

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
      console.error("Error removing guest:", error);
      if (error instanceof Error) {
        return sendErrorResponse(res, 404, error.message);
      }
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
      console.error(`Error removing all ${query}s:`, error);
      if (error instanceof Error) {
        return sendErrorResponse(res, 400, error.message);
      }
      return sendErrorResponse(res, 500, "Server error");
    }
  }
);

export const updateGuest = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.params;
    const { name, email, status } = req.body;

    if (!name || !email || !status) {
      return sendErrorResponse(res, 400, "All fields are required");
    }

    if (
      !GuestService.validateIdFormat(eventId) ||
      !GuestService.validateIdFormat(guestId)
    ) {
      return sendErrorResponse(res, 400, "Invalid ID format");
    }

    const updatedGuest = await GuestService.updateGuestInfo(eventId, guestId, {
      name,
      email,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Guest updated successfully",
      guest: updatedGuest,
    });
  } catch (error) {
    console.error("Error updating guest:", error);
    if (error instanceof Error) {
      return sendErrorResponse(res, 404, error.message);
    }
    return sendErrorResponse(res, 500, "Server error");
  }
});

// Send invitation emails to all guests
export const inviteAllGuest = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const guestData = req.body;
      if (!guestData || !Array.isArray(guestData) || guestData.length === 0) {
        return sendErrorResponse(res, 400, "No guest data provided");
      }

      const eventId = guestData[0].eventId;

      if (!GuestService.validateIdFormat(eventId)) {
        return sendErrorResponse(res, 400, "Invalid Event ID");
      }

      const event = await GuestService.getEventById(eventId);
      if (!event) {
        return sendErrorResponse(res, 404, "Event not found");
      }

      await GuestService.sendEmailToGuests(guestData, event);

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
      !GuestService.validateIdFormat(eventId as string) ||
      !GuestService.validateIdFormat(guestId as string)
    ) {
      return sendErrorResponse(res, 400, "Invalid eventId or guestId format");
    }

    const result = await GuestService.validateGuestURL(
      eventId as string,
      guestId as string
    );

    return res.status(200).json({
      success: true,
      guest: result.guest,
    });
  } catch (error) {
    console.error("Error validating URL:", error);
    if (error instanceof Error) {
      return sendErrorResponse(res, 404, error.message);
    }
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

      const result = await GuestService.submitGuestResponse(
        guestId,
        eventId,
        attending
      );

      return res.status(200).json({
        success: true,
        message: `RSVP ${result.status}`,
      });
    } catch (error) {
      console.error("Error processing RSVP response:", error);
      if (error instanceof Error) {
        return sendErrorResponse(res, 404, error.message);
      }
      return sendErrorResponse(res, 500, "Server error");
    }
  }
);

// Send reminder email to guest
export const sendReminder = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId, name, email, _id: guestId } = req.body;

      if (
        !GuestService.validateIdFormat(eventId) ||
        !GuestService.validateIdFormat(guestId)
      ) {
        return sendErrorResponse(res, 400, "Invalid ID format");
      }

      const event = await GuestService.getEventById(eventId);
      if (!event) {
        return sendErrorResponse(res, 404, "Event not found");
      }

      await GuestService.sendEmailToGuests(
        [{ name, email, _id: guestId }],
        event,
        true
      );

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
