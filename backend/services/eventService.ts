import Event, { EventDocument } from "../models/eventModel";
import Vendor from "../models/vendorModel";
import ApiError from "../utils/ApiError";
import { uploadImageToCloudinary, buildEventData } from "../utils/eventBuild";
import { resetBudgetExceedanceAlert } from "../controllers/vendorController";
import mongoose from "mongoose";

// Create a new event

export const createEvent = async (
  data: any,
  file: Express.Multer.File | undefined,
  userId: string
): Promise<EventDocument> => {
  const requiredFields = [
    "name",
    "date",
    "location",
    "description",
    "eventType",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new ApiError(400, `Missing field: ${field}`);
    }
  }

  const eventDate = new Date(data.date);
  if (isNaN(eventDate.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }

  let image = "";
  if (file) {
    try {
      image = await uploadImageToCloudinary(file);
    } catch (error) {
      throw new ApiError(500, "Failed to upload image");
    }
  }

  const eventData = buildEventData(data, image, userId);
  return await Event.create(eventData);
};

// Get all events for a user

export const getEvents = async (userId: string): Promise<any[]> => {
  return await Event.find({ creator: userId })
    .select("-includedInSplit")
    .sort({ date: 1 })
    .lean();
};

// Get event by ID

export const getEventById = async (eventId: string): Promise<EventDocument> => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(404, "Invalid event ID format");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event Not Found");
  }

  return event;
};

// Update an event

export const updateEvent = async (
  eventId: string,
  data: any,
  file: Express.Multer.File | undefined
): Promise<EventDocument | null> => {
  let image = "";
  if (file) {
    try {
      image = await uploadImageToCloudinary(file);
    } catch (error) {
      throw new ApiError(500, "Failed to upload image");
    }
  }

  const updatedData = buildEventData(data, image || undefined);
  const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedData, {
    new: true,
  });

  if (!updatedEvent) {
    throw new ApiError(404, "Event not found");
  }

  return updatedEvent;
};

// Delete an event

export const deleteEvent = async (
  eventId: string,
  userId: string
): Promise<void> => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.creator.toString() !== userId) {
    throw new ApiError(403, "Not authorized to delete this event");
  }

  await Event.findByIdAndDelete(eventId);
  await Vendor.deleteMany({ event: eventId });
};

// Adjust event budget

export const adjustEventBudget = async (
  eventId: string,
  adjustAmount: number
): Promise<any> => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, "Event Not Found");
  }

  event.budget.allocated = event.budget.allocated + adjustAmount;

  if (typeof resetBudgetExceedanceAlert === "function") {
    resetBudgetExceedanceAlert(eventId);
  }

  await event.save();

  return event.budget;
};
