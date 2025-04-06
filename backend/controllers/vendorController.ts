import Vendor, { VendorDocument } from "../models/vendorModel";
import Event, { EventDocument } from "../models/eventModel";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
const axios = require("axios");

export const getVendor = asyncHandler(async (req: Request, res: Response) => {
  const { query, location, page = 1 } = req.query;

  if (!query || !location) {
    return res.status(400).json({ error: "Missing query or location" });
  }

  const serpRes = await axios.get("https://serpapi.com/search.json", {
    params: {
      engine: "google_local",
      q: query,
      location,
      api_key:
        "6e635493e84ba85b663b0d0d53dd22c431b99f142910ea8064a5f7bba23f896f",
    },
  });

  const allVendors = serpRes.data.local_results || [];
  const perPage = 6;
  const pageNum = parseInt(page as string) || 1;

  const startIdx = (pageNum - 1) * perPage;
  const paginated = allVendors.slice(startIdx, startIdx + perPage);

  res.json({
    vendors: paginated,
    pagination: {
      currentPage: pageNum,
      perPage,
      hasMore: startIdx + perPage < allVendors.length,
    },
  });
});

export const addVendors = async (req: Request, res: Response) => {
  try {
    const vendorData = req.body;

    // Prevent duplicate vendors by placeId
    const existing = await Vendor.findOne({ placeId: vendorData.placeId });
    if (existing) {
      res.status(400).json({ message: "Vendor already added" });
      return;
    }

    // Cast vendor as VendorDocument so TypeScript knows it has `price`
    const vendor = (await Vendor.create(vendorData)) as VendorDocument;

    // Find the related event and cast as EventDocument
    const event = (await Event.findById(vendor.event)) as EventDocument | null;

    if (!event) {
      res.status(404).json({ message: "Associated event not found" });
      return;
    }

    // Update the event budget
    event.budget.spent += vendor.price;
    await event.save();

    res.status(201).json(vendor);
  } catch (err: any) {
    console.error("Vendor creation failed:", err);
    res.status(500).json({
      message: "Failed to create vendor",
      error: err.message,
    });
  }
};

export const getVendorsByEvent = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find({ event: req.params.eventId });
    res.json(vendors);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching vendors", error: error.message });
  }
};
