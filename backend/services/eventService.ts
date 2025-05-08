import Event, { EventDocument } from "../models/eventModel";
import Vendor from "../models/vendorModel";
import ApiError from "../utils/ApiError";
import { uploadImageToCloudinary, buildEventData } from "../utils/eventBuild";
import { resetBudgetExceedanceAlert } from "../controllers/vendorController";
import mongoose, { Types } from "mongoose";

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
interface EventFilterOptions {
  page?: number;
  limit?: number;
  tab?: string;
  search?: string;
  date?: string;
  location?: string;
}

export const getEvents = async (userId: string, options: EventFilterOptions = {}) => {
  const {
    page = 1,
    limit = 8,
    tab,
    search,
    date,
    location
  } = options;

  // Build the filter conditions
  const filter: any = { creator: new Types.ObjectId(userId) };
  
  // Status/tab filter - determine past or upcoming events
  if (tab) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tab === 'past') {
      filter.date = { $lt: today };
    } else if (tab === 'upcoming') {
      filter.date = { $gte: today };
    }
    // If tab is 'all', don't add any date filters
  }
  
  // Text search filter on name and description
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Date filter - match events on the specified date
  if (date) {
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Override any previous date filter from tab
    filter.date = {
      $gte: selectedDate,
      $lt: nextDay
    };
  }
  
  // Location filter
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  // For debugging - log the filter object
  console.log("Filter applied:", JSON.stringify(filter, null, 2));

  // Calculate pagination parameters
  const skip = (page - 1) * limit;
  
  // Execute query with pagination
  const events = await Event.find(filter)
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const totalEvents = await Event.countDocuments(filter);
  const totalPages = Math.ceil(totalEvents / limit);

  return {
    events,
    currentPage: page,
    totalPages,
    totalEvents,
    limit
  };
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
