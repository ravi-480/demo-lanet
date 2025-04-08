import { Request, Response } from "express";
import Event from "../models/eventModel";
import { asyncHandler } from "../utils/asyncHandler";
import { buildEventData, uploadImageToCloudinary } from "../utils/eventBuild";
import Vendor from "../models/vendorModel";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const createEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const requiredFields = ["name", "date", "location", "description"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ success: false, message: `Missing field: ${field}` });
      }
    }

    let image = "";

    if (req.file) {
      try {
        image = await uploadImageToCloudinary(req.file);
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: "Failed to upload image on " });
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
      return res.status(500).json({
        success: false,
        message: "Error creating event",
        error: error.message,
      });
    }
  }
);

export const fetchEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Ensure cookies are available
    if (!req.cookies || !req.cookies.user) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized - No user data" });
      return;
    }

    // Parse user data safely
    let userData;
    try {
      userData = JSON.parse(req.cookies.user);
    } catch (error) {
      res.status(400).json({ success: false, message: "Invalid user data" });
      return;
    }

    const userId = userData?.id; // MongoDB uses `_id`

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Fetch only events created by this user
    const events = await Event.find({ creator: userId })
      .sort({ date: 1 })
      .lean();

    res.status(200).json({ success: true, events });
    return;
  } catch (error: any) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
    return;
  }
};

export const fetchById = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    if (!eventId) {
      res.status(400).json({ success: false, meesage: "Event ID is required" });
      return;
    }
    const event = await Event.findById(eventId).lean();

    if (!event) {
      res.status(404).json({ success: false, message: "Event Not Found" });
    }
    res.status(200).json({ success: true, event });
  } catch (error: any) {
    console.log("Error fetching Event By Id", error);
    res.status(500).json({ success: false, message: "Failed to fetch Event" });
  }
};

export const updateEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { eventId } = req.body;
    console.log(req.body);

    if (!eventId)
      return res
        .status(400)
        .json({ success: false, message: "Missing EventID" });

    let image = "";

    if (req.file) {
      try {
        image = await uploadImageToCloudinary(req.file);
      } catch (error) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload image" });
      }
    }
    const updatedData = buildEventData(req.body, image || undefined);

    try {
      const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedData, {
        new: true,
      });

      if (!updatedEvent) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Event updated successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update data" });
    }
  }
);

// deleting an event

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ success: false, message: "Missing EventID" });

  const deletedEvent = await Event.findByIdAndDelete(id);

  const deletedVendor = await Vendor.deleteMany({ event: id });

  if (!deletedEvent && !deletedVendor)
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete an event" });

  return res
    .status(201)
    .json({ success: true, message: "Event Deleted successfully" });
});
