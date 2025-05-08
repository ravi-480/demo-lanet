import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../interfaces/user.interface";
import ApiError from "../utils/ApiError";
import * as eventService from "../services/eventService";

export const createEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Unauthorized: User not authenticated");
    }

    const newEvent = await eventService.createEvent(
      req.body,
      req.file,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  }
);

export const fetchEvents = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.id) {
      throw new ApiError(401, "Unauthorized access");
    }

    // Extract query parameters for filtering and pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const tab = req.query.tab as string;  // Changed from 'status' to 'tab'
    const search = req.query.search as string;
    const date = req.query.date as string;
    const location = req.query.location as string;

  
    // Get events with filters and pagination
    const { 
      events, 
      currentPage, 
      totalPages, 
      totalEvents 
    } = await eventService.getEvents(
      req.user.id, 
      { 
        page, 
        limit, 
        tab,  // Changed from 'status' to 'tab'
        search, 
        date, 
        location 
      }
    );

    return res.status(200).json({
      success: true,
      events,
      currentPage,
      totalPages,
      totalEvents,
      limit
    });
  }
);

export const fetchById = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.id;

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  const event = await eventService.getEventById(eventId);

  return res.status(200).json({
    success: true,
    event,
  });
});

export const updateEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const eventId = req.params.id;

    if (!eventId) {
      throw new ApiError(400, "Missing EventID");
    }

    const updatedEvent = await eventService.updateEvent(
      eventId,
      req.body,
      req.file
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  }
);

export const deleteEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id) throw new ApiError(400, "Missing EventID");

    if (!req.user?.id) {
      throw new ApiError(401, "Unauthorized access");
    }

    await eventService.deleteEvent(id, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  }
);

export const adjustEventBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = req.params.id;
    const { adjustAmount } = req.body;

    if (!eventId || adjustAmount === undefined) {
      throw new ApiError(400, "Event ID and adjust amount are required.");
    }

    const updatedBudget = await eventService.adjustEventBudget(
      eventId,
      adjustAmount
    );

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      updatedBudget,
    });
  }
);
