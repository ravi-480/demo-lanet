import Vendor, { VendorDocument } from "../models/vendorModel";
import Event, { EventDocument } from "../models/eventModel";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { sendEmail } from "../utils/emailService";
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

    const existing = await Vendor.findOne({ placeId: vendorData.placeId });
    if (existing) {
      res.status(400).json({ success: false, message: "Vendor already added" });
      return;
    }

    const vendor = await Vendor.create(vendorData);

    // Find the related event and cast as EventDocument
    const event = await Event.findById(vendor.event);

    if (!event) {
      res
        .status(404)
        .json({ success: false, message: "Associated event not found" });
      return;
    }

    // Update the event budget
    event.budget.spent += vendor.price;
    await event.save();

    res
      .status(201)
      .json({ sucess: true, message: "Vendor added successfully", vendor });
  } catch (err: any) {
    console.error("Vendor creation failed:", err);
    res.status(500).json({
      success: false,
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
    return res.status(401).json({ success: false, message: "unauthorized" });
  }
  const vendors = await Vendor.find({ addedBy: userId }).sort({
    createdAt: -1,
  });
  return res.status(200).json(vendors);
});

// add vendor in split
export const addVendorInSplitOrRemove = asyncHandler(
  async (req: Request, res: Response) => {
    const { vendorId } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Event not found" });
    console.log(vendor);

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
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!Array.isArray(event.includedInSplit)) {
      event.includedInSplit = [];
    }

    event.includedInSplit = [...event.includedInSplit, user];
    await event.save();
    return res
      .status(200)
      .json({ success: true, message: "User added in split successfully" });
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

    if (!id) return res.status(400).json({ message: "Vendor ID is required" });

    // Find and delete the vendor
    const vendor = await Vendor.findByIdAndDelete(id);

    if (!vendor)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });

    // Subtract the price from the event's spent budget
    const updatedEvent = await Event.findByIdAndUpdate(
      vendor.event,
      { $inc: { "budget.spent": -vendor.price } },
      { new: true }
    );

    console.log(updatedEvent);

    if (!updatedEvent)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

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
      .json({ success: true, message: "User Paid Successfully" });
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
        .json({ success: false, message: "Invalid User Id" });
    }
    return res.status(200).json({ success: true, status: user.status });
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
      success: true,
      message: "User deleted successfully from split",
    });
  }
);

export const editUserInSplit = asyncHandler(
  async (req: Request, res: Response) => {
    const { user, id } = req.body;

    if (!user || !id) {
      res.status(400);
      throw new Error("Missing required fields: user details or event ID");
    }

    try {
      const event = await Event.findById(id);

      if (!event) {
        res.status(404);
        throw new Error("Event not found");
      }

      // Find the user in the includedInSplit array
      const userIndex = event.includedInSplit.findIndex(
        (u: any) => u._id.toString() === user._id
      );

      if (userIndex === -1) {
        res.status(404);
        throw new Error("User not found in split");
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
    } catch (error: any) {
      res.status(500);
      throw new Error(error.message || "Failed to update user");
    }
  }
);

// add manual expense
export const addManualExpense = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { title, price, status, eventId, pricingUnit } = req.body;

      if (!title || !price || !status || !eventId || !pricingUnit) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const priceAsNumber = Number(price);

      // Find the event
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Associated event not found",
        });
      }

      const addedBy = event.creator;
      if (!addedBy) {
        return res.status(500).json({
          success: false,
          message: "Event creator not found",
        });
      }

      const manualVendor = await Vendor.create({
        title,
        price: priceAsNumber,
        category: status,
        pricingUnit,
        event: eventId,
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
    } catch (error) {
      console.error("Error adding manual expense:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add manual expense",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
