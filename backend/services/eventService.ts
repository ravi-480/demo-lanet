import Event, { EventDocument } from "../models/eventModel";
import { buildEventData, uploadImageToCloudinary } from "../utils/eventBuild";
import ApiError from "../utils/ApiError";
import mongoose from "mongoose";
import Vendor from "../models/vendorModel";

export const createEventService = async (
  body: any,
  file: Express.Multer.File | undefined,
  userId: string
) => {
  // Validate required fields
  const requiredFields = [
    "name",
    "date",
    "location",
    "description",
    "eventType",
  ];
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new ApiError(400, `Missing field: ${field}`);
    }
  }

  // Validate date
  const eventDate = new Date(body.date);
  if (isNaN(eventDate.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }

  // Upload image if provided
  let image = "";
  if (file) {
    try {
      image = await uploadImageToCloudinary(file);
    } catch (error) {
      throw new ApiError(500, "failed to upload image");
    }
  }

  // Build event data
  const eventData = buildEventData(body, image, userId);

  // Create event
  try {
    return await Event.create(eventData);
  } catch (error: any) {
    console.log(error);
    throw new ApiError(500, "Error in creating events");
  }
};

export const fetchUserEventsService = async (userId: string) => {
  if (!userId) {
    throw new ApiError(401, "Unauthorized - Invalid user ID");
  }

  return await Event.find({ creator: userId }).sort({ date: 1 }).lean();
};

export const fetchEventByIdService = async (eventId: string) => {
  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(404, "Invalid event ID format or Event Not Found");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, "Event Not Found");
  }

  return event;
};

export const updateEventService = async (
  body: any,
  file: Express.Multer.File | undefined
) => {
  const { eventId } = body;

  if (!eventId) {
    throw new ApiError(400, "Missing EventID");
  }

  let image = "";

  if (file) {
    try {
      image = await uploadImageToCloudinary(file);
    } catch (error) {
      throw new ApiError(500, "Failed to upload image");
    }
  }

  const updatedData = buildEventData(body, image || undefined);

  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedData, {
      new: true,
    });

    if (!updatedEvent) {
      throw new ApiError(404, "Event not found");
    }

    return updatedEvent;
  } catch (error) {
    throw new ApiError(500, "Failed to update data");
  }
};

export const deleteEventService = async (eventId: string) => {
  if (!eventId) throw new ApiError(400, "Missing EventID");

  const deletedEvent = await Event.findByIdAndDelete(eventId);
  const deletedVendor = await Vendor.deleteMany({ event: eventId });

  if (!deletedEvent && !deletedVendor)
    throw new ApiError(500, "Failed to delete an event");

  return { success: true };
};

export const adjustEventBudgetService = async (
  eventId: string,
  adjustAmount: number
) => {
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

  return event.budget;
};
