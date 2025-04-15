import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import XLSX from "xlsx";
import Guest from "../models/rsvpSchema";
import mongoose from "mongoose";

// Upload Guests from Excel File
export const addGuestFromFile = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Event ID" });
      }

      const file = req.file;
      if (!file) {
        return res
          .status(400)
          .json({ success: false, message: "File not uploaded" });
      }

      const workBook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workBook.SheetNames[0];
      const sheet = workBook.Sheets[sheetName];
      const guests = XLSX.utils.sheet_to_json(sheet);

      if (!Array.isArray(guests) || guests.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No data found in file" });
      }

      const guestsWithEvent = guests.map((guest: any) => ({
        name: guest.name || "unknown",
        email: guest.email || "nomail@gmail.com",
        status: "Pending",
        eventId: new mongoose.Types.ObjectId(eventId),
      }));

      await Guest.insertMany(guestsWithEvent);

      return res.status(201).json({
        success: true,
        message: "Guests added successfully",
        count: guestsWithEvent.length,
      });
    } catch (error) {
      console.error("Error in addGuestFromFile:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Get Guests by Event ID
export const getUserByEventId = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Event ID" });
      }

      const rsvpList = await Guest.find({ eventId });

      if (!rsvpList || rsvpList.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No guests found" });
      }

      return res.status(200).json({
        success: true,
        message: "Guests fetched successfully",
        rsvpList,
      });
    } catch (error) {
      console.error("Error in getUserByEventId:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// add single guest manually

export const addSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    const { data } = req.body;
    await Guest.create(data);
    return res
      .status(201)
      .json({ success: true, message: "Guest added Successfully" });
  }
);

export const removeSingleGuest = asyncHandler(
  async (req: Request, res: Response) => {
    const { guestId } = req.query;

    await Guest.findByIdAndDelete(guestId);

    return res
      .status(200)
      .json({ success: true, message: "Guest removed successfully" });
  }
);

// controllers/guestController.ts

export const updateGuest = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.params;
    const { name, email, status } = req.body;

    if (!name || !email || !status) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find and update the guest
    const updatedGuest = await Guest.findOneAndUpdate(
      { _id: guestId, eventId },
      { name, email, status },
      { new: true }
    );

    if (!updatedGuest) {
      return res.status(404).json({ message: "Guest not found." });
    }

    return res.status(200).json(updatedGuest);
  } catch (error) {
    console.error("Error updating guest:", error);
    return res.status(500).json({ message: "Server error." });
  }
});
