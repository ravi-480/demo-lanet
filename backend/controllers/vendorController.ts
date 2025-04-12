import Vendor, { VendorDocument } from "../models/vendorModel";
import Event, { EventDocument } from "../models/eventModel";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { sendEmail } from "../utils/emailService";
import { log } from "console";
const axios = require("axios");

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

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

export const getVendorsByEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const vendors = await Vendor.find({ event: req.params.eventId });
    res.json(vendors);
  }
);

export const getByUser = asyncHandler(async (req: Request, res: Response) => {
  let reqUser = req as AuthenticatedRequest;
  const userId = reqUser.user.id;

  if (!userId) {
    return res.status(401).json({ message: "unauthorized" });
  }
  const vendors = await Vendor.find({ addedBy: userId }).sort({
    createdAt: -1,
  });
  return res.status(200).json(vendors);
});

// add vendor in split

export const addVendorInSplit = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, selected } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!Array.isArray(event.vendorsInSplit)) {
      event.vendorsInSplit = [];
    }

    event.vendorsInSplit = [...selected];
    await event.save();
    res
      .status(200)
      .json({ status: "success", message: "Vendor added successfully" });
  }
);

// add user in split

export const addUserInSplit = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, user } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!Array.isArray(event.includedInSplit)) {
      event.includedInSplit = [];
    }

    event.includedInSplit = [...event.includedInSplit, user];
    await event.save();
  }
);

// send mail to users

export const sendMailToUser = asyncHandler(async (req, res) => {
  const { recipients, amounts, eventId, userId } = req.body;
  console.log(eventId, userId);

  try {
    for (let i = 0; i < recipients.length; i++) {
      await sendEmail({
        to: recipients[i],
        subject: "Split Expense Request",
        text: "",
        html: `
      <h3>Hello from Split App</h3>
      <p>You’ve been asked to confirm a split expense of <strong>₹${amounts[i]}</strong>.</p>
      <p>
    <a href="http://localhost:3000/split/confirm?eventId=${eventId[i]}&userId=${userId[i]}"
       style="background-color:#0ea5e9;padding:10px 20px;color:white;text-decoration:none;border-radius:5px;">
      Confirm Your Share
    </a>
        </a>
      </p>
    `,
      });
    }

    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send emails." });
  }
});

// remove added vendors

export const removeAddedVendor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(404).json({ message: "Id not found" });

    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor)
      return res
        .status(404)
        .json({ success: "failed", msg: "Vendor not found" });

    res.status(200).json({ message: "Vendor remove successfully!" });
  }
);

// confirm payment request

export const confirmPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, userId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    const user = event?.includedInSplit.find(
      (item: any) => item._id?.toString() == userId
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: "failed", message: "Invalid User Id" });
    }

    user.status = "Paid";
    await event.save();
    return res
      .status(200)
      .json({ status: "Succcess", message: "User Paid Successfully" });
  }
);

// check payment status

export const checkPaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, userId } = req.query;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const user = event?.includedInSplit.find(
      (item: any) => item._id?.toString() == userId
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: "failed", message: "Invalid User Id" });
    }
    return res.status(200).json({ status: user.status });
  }
);

// delete added user in split

export const removeFromSplit = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, id } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    console.log(userId);

    event.includedInSplit = event?.includedInSplit.filter(
      (person: any) => person._id.toString() !== userId
    );
    await event.save();
    return res.status(200).json({
      status: "success",
      message: "User deleted successfully from split",
    });
  }
);
