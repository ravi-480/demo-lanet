import Vendor from "../models/vendorModel";
import Event from "../models/eventModel";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { sendEmail } from "../utils/emailService";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../utils/ApiError";
import { log } from "util";
const axios = require("axios");

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

export const getVendor = asyncHandler(async (req: Request, res: Response) => {
  const { query, location, page = 1 } = req.query;

  if (!query || !location) {
    return res
      .status(400)
      .json({ success: false, error: "Missing query or location" });
  }

  if (!process.env.SERPAPI_KEY) {
    throw new Error("Missing SerpAPI key in environment variables");
  }

  const serpRes = await axios.get("https://serpapi.com/search.json", {
    params: {
      engine: "google_local",
      q: query,
      location,
      api_key: process.env.SERPAPI_KEY,
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

export const addVendors = asyncHandler(async (req: Request, res: Response) => {
  const vendorData = req.body;

  const existing = await Vendor.findOne({
    placeId: vendorData.placeId,
    event: vendorData.event,
  });
  if (existing) {
    throw new ApiError(400, "vendor already added");
  }

  const vendor = await Vendor.create(vendorData);

  // Find the related event and cast as EventDocument
  const event = await Event.findById(vendor.event);

  if (!event) {
    throw new ApiError(404, "Associated event not found");
  }

  // Update the event budget
  event.budget.spent += vendor.price;
  await event.save();

  res
    .status(201)
    .json({ sucess: true, message: "Vendor added successfully", vendor });
});

export const getVendorsByEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { includeSplit } = req.query;

    const query: any = { event: eventId };

    if (includeSplit === "true") {
      query.isIncludedInSplit = true;
    }

    const vendors = await Vendor.find(query);
    res.json(vendors);
  }
);

export const getByUser = asyncHandler(async (req: Request, res: Response) => {
  let reqUser = req as AuthenticatedRequest;
  const userId = reqUser.user.id;

  if (!userId) {
    throw new ApiError(401, "unauthorized");
  }
  const vendors = await Vendor.find({ addedBy: userId }).sort({
    createdAt: -1,
  });
  if (!vendors) {
    throw new ApiError(404, "no vendors found");
  }

  return res.status(200).json(vendors);
});

// add vendor in split
export const addVendorInSplitOrRemove = asyncHandler(
  async (req: Request, res: Response) => {
    const { vendorId } = req.body;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) throw new ApiError(404, "Event not found");

    vendor.isIncludedInSplit = !vendor.isIncludedInSplit;

    await vendor.save();

    res.status(200).json({
      status: "success",
      message: "Vendor added in split successfully",
    });
  }
);

// add user in split

export const addUserInSplit = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, user } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Check if user with same email already exists
    const alreadyIncluded = event.includedInSplit.some(
      (u: any) => u.email === user.email
    );

    if (alreadyIncluded) {
      throw new ApiError(400, "User already included in split");
    }

    event.includedInSplit.push(user);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "User added in split successfully",
    });
  }
);

// send mail to users

export const sendMailToUser = asyncHandler(async (req, res) => {
  const { recipients, amounts, eventId, userId } = req.body;

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

    return res.status(200).json({ message: "Emails sent successfully!" });
  } catch (error) {
    throw new ApiError(500, "Failed to send emails.");
  }
});

// remove added vendors

export const removeAddedVendor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) throw new ApiError(400, "Vendor ID is required");

    // Find and delete the vendor
    const vendor = await Vendor.findByIdAndDelete(id);

    if (!vendor) throw new ApiError(404, "Vendor not found");

    // Subtract the price from the event's spent budget
    const updatedEvent = await Event.findByIdAndUpdate(
      vendor.event,
      { $inc: { "budget.spent": -vendor.price } },
      { new: true }
    );

    if (!updatedEvent) throw new ApiError(404, "Event not found");

    return res.status(200).json({
      success: true,
      message: "Vendor removed successfully and budget updated!",
    });
  }
);

// confirm payment request

export const confirmPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, userId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    const user = event?.includedInSplit.find(
      (item: any) => item._id?.toString() == userId
    );
    if (!user) {
      throw new ApiError(400, "Invalid User Id");
    }

    user.status = "Paid";
    await event.save();
    return res
      .status(200)
      .json({ success: true, message: "User Paid Successfully" });
  }
);

// check payment status

export const checkPaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, userId } = req.query;
    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, "Event not found");
    const user = event?.includedInSplit.find(
      (item: any) => item._id?.toString() == userId
    );
    if (!user) {
      throw new ApiError(400, "Invalid User Id");
    }
    return res.status(200).json({ success: true, status: user.status });
  }
);

// delete added user in split

export const removeFromSplit = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, id } = req.body;

    const event = await Event.findById(id);
    if (!event) throw new ApiError(404, "Event not found");

    event.includedInSplit = event?.includedInSplit.filter(
      (person: any) => person._id.toString() !== userId
    );
    await event.save();
    return res.status(200).json({
      success: true,
      message: "User deleted successfully from split",
    });
  }
);

export const editUserInSplit = asyncHandler(
  async (req: Request, res: Response) => {
    const { user, id } = req.body;

    if (!user || !id) {
      throw new ApiError(
        400,
        "Missing required fields: user details or event ID"
      );
    }

    const event = await Event.findById(id);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Find the user in the includedInSplit array
    const userIndex = event.includedInSplit.findIndex(
      (u: any) => u._id.toString() === user._id
    );

    if (userIndex === -1) {
      throw new ApiError(404, "User not found in split");
    }

    // Update the user details
    event.includedInSplit[userIndex].name = user.name;
    event.includedInSplit[userIndex].email = user.email;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: event.includedInSplit[userIndex],
    });
  }
);

// add manual expense
export const addManualExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, price, status, eventId, pricingUnit } = req.body;
    console.log(req.body);

    if (!title || !price || !status || !eventId || !pricingUnit) {
      throw new ApiError(400, "Missing required fields");
    }

    const priceAsNumber = Number(price);

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(404, "Associated event not found");
    }

    const addedBy = event.creator;
    if (!addedBy) {
      throw new ApiError(404, "Event creator not found");
    }
    const randomPlaceId = uuidv4();

    const manualVendor = await Vendor.create({
      title,
      price: priceAsNumber,
      category: status,
      pricingUnit,
      event: eventId,
      placeId: randomPlaceId,
      addedBy,

      isIncludedInSplit: false,
    });

    // Update event budget
    event.budget.spent += priceAsNumber;
    await event.save();

    res.status(201).json({
      success: true,
      message: "Manual expense added successfully",
      vendor: manualVendor,
    });
  }
);
