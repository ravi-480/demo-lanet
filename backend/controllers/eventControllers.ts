import { Request, Response } from "express";
import Event, { EventDocument } from "../models/eventModel";
import { asyncHandler } from "../utils/asyncHandler";
import { buildEventData, uploadImageToCloudinary } from "../utils/eventBuild";
import Vendor from "../models/vendorModel";
import { AuthenticatedRequest } from "../interfaces/user.interface";
import ApiError from "../utils/ApiError";
import mongoose from "mongoose";

export const createEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Unauthorized: User not authenticated");
    }

    const requiredFields = [
      "name",
      "date",
      "location",
      "description",
      "eventType",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new ApiError(400, `Missing field,:${field}`);
      }
    }

    const eventDate = new Date(req.body.date);
    if (isNaN(eventDate.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }

    let image = "";

    if (req.file) {
      try {
        image = await uploadImageToCloudinary(req.file);
      } catch (error) {
        throw new ApiError(500, "failed to upload image");
      }
    }

    const eventData = buildEventData(req.body, image, req.user.id);

    try {
      const newEvent = await Event.create(eventData);
      return res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: newEvent,
      });
    } catch (error: any) {
      console.log(error);

      throw new ApiError(500, "Error in creating events");
    }
  }
);

// fetch all events

export const fetchEvents = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    console.log(req.user);

    if (!req.user) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized - No user data" });
      return;
    }

    // Now safely access req.user.id
    const userId = req.user.id;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized - Invalid user ID" });
      return;
    }

    // Fetch only events created by this user
    const events = await Event.find({ creator: userId })
      .sort({ date: 1 })
      .lean();

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

// fetch events by id
export const fetchById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    console.log(eventId);

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(404).json({
        success: false,
        message: "Invalid event ID format or Event Not Found",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event Not Found",
      });
    }

    return res.status(200).json({ success: true, event });
  } catch (error: any) {
    console.error("Event fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Event",
      error: error.message,
    });
  }
});
// edit event
export const updateEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { eventId } = req.body;

    if (!eventId) {
      throw new ApiError(400, "Missing EventID");
    }

    let image = "";

    if (req.file) {
      try {
        image = await uploadImageToCloudinary(req.file);
      } catch (error) {
        throw new ApiError(500, "Failed to upload image");
      }
    }
    const updatedData = buildEventData(req.body, image || undefined);

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedData, {
      new: true,
    });

    if (!updatedEvent) {
      throw new ApiError(404, "Event not found");
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
    });
  }
);

// deleting an event

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Missing EventID");

  const deletedEvent = await Event.findByIdAndDelete(id);

  const deletedVendor = await Vendor.deleteMany({ event: id });

  if (!deletedEvent && !deletedVendor)
    throw new ApiError(500, "Failed to delete an event");

  return res
    .status(201)
    .json({ success: true, message: "Event Deleted successfully" });
});

// adjust event budget amount

export const adjustEventBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, adjustAmount } = req.body.data;

    if (!eventId || adjustAmount === undefined) {
      throw new ApiError(400, "Event ID and adjust amount are required.");
    }
    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, "Event Not Found");
    if (event.budget.allocated > event.budget.spent) {
      throw new ApiError(
        400,
        "Allocated budget is already greater than spent amount."
      );
    }
    event.budget.allocated = event.budget.allocated + adjustAmount;

    await event.save();
    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      updatedBudget: event.budget,
    });
  }
);
