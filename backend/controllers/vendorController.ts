import Vendor from "../models/vendorModel";
import Event from "../models/eventModel";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { sendEmail } from "../services/emailService";
import { v4 as uuidv4 } from "uuid";
import Notification from "../models/notificationModel";
import ApiError from "../utils/ApiError";
import {
  getRefundSplitEmailTemplate,
  getSplitRequestEmailTemplate,
  sendBudgetExceededEmail,
  sendBudgetWarningEmail,
} from "../utils/emailTemplate";
import User from "../models/UserModel";
import mongoose from "mongoose";
import { getIO } from "../utils/socketUtils";
import { validateIdFormat } from "../utils/helper";
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

  const searchQuery = String(query);
  const searchLocation = String(location);

  let serpRes;
  try {
    serpRes = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_local",
        q: searchQuery,
        location: searchLocation,
        api_key: process.env.SERPAPI_KEY,
      },
    });
  } catch (error: any) {
    const serpError = error?.response?.data?.error;
    if (serpError?.includes("Unsupported") && serpError?.includes("location")) {
      throw new ApiError(400, `Invalid location: "${searchLocation}"`);
    }

    console.log("SerpAPI error:", error?.response?.data || error);
    throw new ApiError(502, "Error fetching vendor data from external API");
  }

  const allVendors = serpRes.data.local_results || [];

  if (!Array.isArray(allVendors) || allVendors.length === 0) {
    throw new ApiError(
      404,
      `No vendors found for "${searchQuery}" in "${searchLocation}"`
    );
  }

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

const budgetAlertsSent = new Map<string, Set<string>>();

// Initialize budget alert tracking for an event
const initializeEventAlertTracking = (eventId: string) => {
  if (!budgetAlertsSent.has(eventId)) {
    budgetAlertsSent.set(eventId, new Set<string>());
  }
};

// Check if alert has been sent for this threshold
const hasAlertBeenSent = (eventId: string, alertType: string): boolean => {
  const eventAlerts = budgetAlertsSent.get(eventId);
  return eventAlerts ? eventAlerts.has(alertType) : false;
};

// Mark alert as sent
const markAlertAsSent = (eventId: string, alertType: string): void => {
  const eventAlerts = budgetAlertsSent.get(eventId);
  if (eventAlerts) {
    eventAlerts.add(alertType);
  }
};

// Reset budget exceedance alert after budget adjustment
export const resetBudgetExceedanceAlert = (eventId: string): void => {
  const eventAlerts = budgetAlertsSent.get(eventId);
  if (eventAlerts) {
    eventAlerts.delete("BUDGET_EXCEEDED");
  }
};

export const addVendors = asyncHandler(async (req: Request, res: Response) => {
  const vendorData = req.body;

  // Check if vendor already exists for this event
  const existing = await Vendor.findOne({
    placeId: vendorData.placeId,
    event: vendorData.event,
  });

  if (existing) {
    throw new ApiError(400, "Vendor already added");
  }

  // Create the new vendor
  const vendor = await Vendor.create({
    ...vendorData,
    finalPrice: vendorData.price,
  });

  // Find the related event
  const event = await Event.findById(vendor.event);
  if (!event) {
    throw new ApiError(404, "Associated event not found");
  }

  // Initialize budget alert tracking for this event
  initializeEventAlertTracking(event._id.toString());

  // Get the user who added the vendor
  const user = await User.findById(vendor.addedBy);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Calculate new spent amount and budget percentage
  const newSpentAmount = event.budget.spent + vendor.price;
  const budgetLimit = event.budget.allocated;
  const budgetPercentage = (newSpentAmount / budgetLimit) * 100;

  // Update the event budget
  event.budget.spent = newSpentAmount;
  await event.save();

  // Send the response immediately
  res.status(201).json({
    success: true,
    message: "Vendor added successfully",
    vendor,
  });

  try {
    // Check if budget is at 90% or more but less than 100%
    if (budgetPercentage >= 90 && budgetPercentage < 100) {
      const alertType = "BUDGET_WARNING";

      // Only send the 90% alert if we haven't already for this event
      if (!hasAlertBeenSent(event._id.toString(), alertType)) {
        sendBudgetWarningEmail(
          user.email,
          event.name,
          budgetLimit,
          newSpentAmount,
          budgetPercentage
        )
          .then(() => {
            // Mark that we've sent the 90% alert for this event
            markAlertAsSent(event._id.toString(), alertType);
          })
          .catch((err) => {
            console.log("Failed to send budget warning email:", err);
          });
      }
    }
    // Check if budget has exceeded 100%
    else if (budgetPercentage >= 100) {
      const alertType = "BUDGET_EXCEEDED";

      // Only send the budget exceeded alert if we haven't already for this event
      // since the last time the budget was adjusted
      if (!hasAlertBeenSent(event._id.toString(), alertType)) {
        sendBudgetExceededEmail(
          user.email,
          event.name,
          budgetLimit,
          newSpentAmount,
          budgetPercentage
        )
          .then(() => {
            // Mark that we've sent the budget exceeded alert for this event
            markAlertAsSent(event._id.toString(), alertType);
          })
          .catch((err) => {
            console.log("Failed to send budget exceeded email:", err);
          });
      }
    }
  } catch (error) {
    // Log any errors but don't affect the response
    console.log("Error processing budget alerts:", error);
  }
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

// Backend API with pagination
export const getByUser = asyncHandler(async (req: Request, res: Response) => {
  let reqUser = req as AuthenticatedRequest;
  const userId = reqUser.user.id;

  if (!userId) {
    throw new ApiError(401, "unauthorized");
  }

  // Get pagination parameters from query
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Get total count for pagination metadata
  const totalCount = await Vendor.countDocuments({ addedBy: userId });

  // Get paginated vendors
  const vendors = await Vendor.find({ addedBy: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!vendors) {
    throw new ApiError(404, "no vendors found");
  }

  // Return pagination metadata along with vendors
  return res.status(200).json({
    vendors,
    pagination: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      itemsPerPage: limit,
    },
  });
});

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
    // Track users who previously paid for notification purposes
    const usersWithPreviousPayments = [];

    // First, check for users who have already paid
    for (let i = 0; i < recipients.length; i++) {
      const event = await Event.findOne({
        _id: eventId[i],
        "includedInSplit.email": recipients[i],
      });

      if (event) {
        const userSplit = event.includedInSplit.find(
          (user) => user.email === recipients[i]
        );
        if (userSplit && userSplit.status === "Paid") {
          usersWithPreviousPayments.push({
            email: recipients[i],
            previousAmount: userSplit.amount,
            newAmount: amounts[i],
            eventId: eventId[i],
            userId: userId[i],
          });
        }
      }
    }

    // Update all users in the split with new amounts and set status to pending
    for (let i = 0; i < recipients.length; i++) {
      await Event.findOneAndUpdate(
        { _id: eventId[i], "includedInSplit.email": recipients[i] },
        {
          $set: {
            "includedInSplit.$.amount": amounts[i],
            "includedInSplit.$.joinedAt": new Date(),
            "includedInSplit.$.status": "pending", // Reset to pending
            "includedInSplit.$.paymentId": null, // Clear payment ID
            "includedInSplit.$.paymentTimestamp": null, // Clear payment timestamp
          },
        },
        { new: true }
      );
    }

    // Send emails
    for (let i = 0; i < recipients.length; i++) {
      console.log(amounts[i], eventId[i], userId[i]);

      // Check if this user had a previous payment
      const previousPayment = usersWithPreviousPayments.find(
        (user) => user.email === recipients[i]
      );

      const { subject, text, html } = previousPayment
        ? getRefundSplitEmailTemplate(
            previousPayment.previousAmount,
            previousPayment.newAmount,
            eventId[i],
            userId[i]
          )
        : getSplitRequestEmailTemplate(amounts[i], eventId[i], userId[i]);

      await sendEmail({
        to: recipients[i],
        subject,
        text,
        html,
      });
    }

    return res
      .status(200)
      .json({ message: "Amounts updated and emails sent successfully!" });
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Failed to send emails or update split data.");
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
      finalPrice:priceAsNumber,
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

export const contactVendor = asyncHandler(
  async (req: Request, res: Response) => {
    let reqUser = req as AuthenticatedRequest;
    const userId = reqUser.user.id;
    try {
      const { vendorId, eventId, notes, isNegotiating, negotiatedPrice } =
        req.body;
      console.log(req.body);

      if (!vendorId || !eventId || !notes) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate IDs
      validateIdFormat(vendorId);

      validateIdFormat(eventId);

      // Find the vendor, user, and event
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Create simple response URLs with query parameters instead of tokens
      const baseUrl = process.env.BASE_URL;

      // Simple parameters for response handling
      const params = new URLSearchParams({
        vendorId,
        eventId,
        userId,
        isNegotiating: isNegotiating ? "true" : "false",
      });

      if (isNegotiating && negotiatedPrice) {
        params.append("negotiatedPrice", negotiatedPrice.toString());
      }

      // Create action URLs with different response types
      const acceptOriginalUrl = `${baseUrl}/vendor/response?${params.toString()}&response=acceptOriginal`;
      const acceptNegotiatedUrl =
        isNegotiating && negotiatedPrice
          ? `${baseUrl}/vendor/response?${params.toString()}&response=acceptNegotiated`
          : "";
      const declineUrl = `${baseUrl}/vendor/response?${params.toString()}&response=decline`;

      // Build email content based on whether it's a negotiation or regular inquiry
      let emailSubject = isNegotiating
        ? `Price Negotiation Request for ${event.name}`
        : `Inquiry for ${event.name}`;

      let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">
          ${isNegotiating ? "Price Negotiation Request" : "New Inquiry"}
        </h2>
        
        <div style="margin: 20px 0;">
          <p><strong>Event:</strong> ${event.name}</p>
          <p><strong>Date:</strong> ${new Date(
            event.date
          ).toLocaleDateString()}</p>
          <p><strong>Message from client:</strong></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${notes}
          </div>
    `;

      // Add price information if this is a negotiation
      if (isNegotiating && negotiatedPrice) {
        emailContent += `
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Original Price:</strong> ₹${vendor.price}</p>
          <p><strong>Proposed Price:</strong> ₹${negotiatedPrice}</p>
        </div>
      `;
      }

      // Add action buttons
      emailContent += `
        <div style="margin: 25px 0;">
          <p><strong>Please respond to this request by clicking one of the options below:</strong></p>
          
          <div style="text-align: center; margin: 20px 0;">
    `;

      // Accept original price button (always show this)
      emailContent += `
          <a href="${acceptOriginalUrl}" style="display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; margin: 0 10px; border-radius: 5px;">
            Accept Original Price (₹${vendor.price})
          </a>
    `;

      // Add negotiated price button if negotiating
      if (isNegotiating && negotiatedPrice) {
        emailContent += `
          <a href="${acceptNegotiatedUrl}" style="display: inline-block; background-color: #2196F3; color: white; text-decoration: none; padding: 10px 20px; margin: 10px; border-radius: 5px;">
            Accept Negotiated Price (₹${negotiatedPrice})
          </a>
      `;
      }

      // Decline button (always show this)
      emailContent += `
          <a href="${declineUrl}" style="display: inline-block; background-color: #f44336; color: white; text-decoration: none; padding: 10px 20px; margin: 0 10px; border-radius: 5px;">
            Decline
          </a>
          </div>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          This is an automated message. Please do not reply directly to this email.
        </p>
      </div>
    `;

      // Send the email to dummy email for development
      const dummyEmail =
        process.env.DUMMY_VENDOR_EMAIL || "kumawatravi7983@gmail.com";

      await sendEmail({
        to: dummyEmail,
        subject: emailSubject,
        html: emailContent,
        text: "",
      });

      // Send success response
      return res.status(200).json({
        message: isNegotiating
          ? "Price negotiation request sent to vendor"
          : "Mail sent to vendor",
      });
    } catch (error: any) {
      console.log("Error in contactVendor:", error);
      return res.status(500).json({
        message: "Failed to contact vendor",
        error: error.message,
      });
    }
  }
);

export const getVendorById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) throw new ApiError(400, "No Vendor id found");
    const vendor = await Vendor.findById(id);
    if (!vendor) throw new ApiError(404, "No vendor found with this id");
    return res.status(200).json({
      success: true,
      message: "Vendor found",
      vendor,
    });
  }
);

export const getVendorResponse = asyncHandler(
  async (req: Request, res: Response) => {
    const { vendorId, eventId, userId, response, finalPrice } = req.body;

    if (!vendorId || !eventId || !userId || !response) {
      throw new ApiError(400, "Missing required parameters");
    }

    // Find the vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }

    // Verify that the vendor belongs to the specified event
    if (vendor.event.toString() !== eventId) {
      throw new ApiError(400, "Vendor is not associated with this event");
    }

    // Find the event to notify the organizer later
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Find the user who made the request
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Store original values for budget calculations
    const originalStatus = vendor.status;
    const originalFinalPrice = vendor.finalPrice || 0;

    // Update vendor status based on response type
    switch (response) {
      case "acceptOriginal":
        vendor.status = "accepted";
        vendor.finalPrice = vendor.price; // Use the original price
        break;

      case "acceptNegotiated":
        vendor.status = "accepted";
        if (finalPrice && typeof finalPrice === "number") {
          vendor.finalPrice = finalPrice;
        } else {
          throw new ApiError(
            400,
            "Invalid final price for negotiated acceptance"
          );
        }
        break;

      case "decline":
        vendor.status = "declined";
        vendor.finalPrice = 0; // Reset final price when declining
        break;

      default:
        throw new ApiError(400, "Invalid response type");
    }

    // Calculate budget adjustment
    let budgetAdjustment = 0;
    if (response.includes("accept")) {
      if (originalStatus === "pending" || originalStatus === "declined") {
        // New acceptance - add the full amount
        budgetAdjustment = vendor.finalPrice;
      } else if (
        originalStatus === "accepted" ||
        originalStatus === "acceptedOriginal"
      ) {
        // Changing from one accepted state to another, adjust by the difference
        budgetAdjustment = vendor.finalPrice - originalFinalPrice;
      }
    } else if (
      response === "decline" &&
      (originalStatus === "accepted" || originalStatus === "acceptedOriginal")
    ) {
      // Changing from accepted to declined - subtract the original amount
      budgetAdjustment = -originalFinalPrice;
    }

    // Save the updated vendor
    await vendor.save();

    // Update event budget if needed
    if (budgetAdjustment !== 0) {
      const newSpent = Math.max(
        0,
        (event.budget.spent || 0) + budgetAdjustment
      );

      await Event.findByIdAndUpdate(
        eventId,
        { $set: { "budget.spent": newSpent } },
        { new: true }
      );
    }

    // Determine notification type and message
    const notificationType = response.includes("accept")
      ? "response"
      : "warning";

    const priceInfo =
      response === "acceptNegotiated"
        ? ` at the negotiated price of ₹${vendor.finalPrice}`
        : response === "acceptOriginal"
        ? ` at the original price of ₹${vendor.price}`
        : "";

    const notificationMessage = response.includes("accept")
      ? `Vendor ${vendor.title} has accepted your request for event ${event.name}${priceInfo}`
      : `Vendor ${vendor.title} has declined your request for event ${event.name}`;

    // Get the organizer's user ID
    const organizerId = event.creator.toString();

    // Create the notification
    const notification = await Notification.create({
      userId: organizerId,
      eventId,
      message: notificationMessage,
      type: notificationType,
      metadata: {
        vendorId,
        vendorTitle: vendor.title,
        vendorStatus: vendor.status,
        finalPrice: vendor.finalPrice,
        budgetChange: budgetAdjustment,
        senderId: userId,
        responseType: response,
      },
    });

    // Emit socket event if possible
    const io = getIO();
    if (io) {
      io.to(`user:${organizerId}`).emit("new-notification", notification);
    }

    return res.status(200).json({
      success: true,
      message: "Vendor response recorded successfully",
      vendor: {
        id: vendor._id,
        title: vendor.title,
        status: vendor.status,
        finalPrice: vendor.finalPrice,
      },
      budgetAdjustment,
    });
  }
);
