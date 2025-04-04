import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import Event from "../models/eventModel";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const createEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, date, location, description, budget, guestLimit } = req.body;

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const userId = req.user.id;

    // Validate required fields
    if (!name || !date || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let image = "";

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      try {
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "events",
          resource_type: "image",
        });
        image = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
        });
      }
    }

    try {
      const eventData = {
        name,
        date: new Date(date),
        location,
        description,
        budget: {
          allocated: Number(budget) || 0,
          spent: 0,
        },
        guestLimit: Number(guestLimit) || 0,
        image,
        status: "upcoming",
        rsvp: {
          total: Number(guestLimit) || 0,
          confirmed: 0,
        },
        creator: new mongoose.Types.ObjectId(userId),
        attendees: [],
      };

      const newEvent = await Event.create(eventData);

      return res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: newEvent,
      });
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Error creating event",
        error: dbError.message,
      });
    }
  }
);

export const fetchEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();

    res.status(200).json(events);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};
