import { Request, Response } from "express";
import ApiError from "../utils/ApiError";
import Razorpay from "razorpay";
import crypto from "crypto";
import Event from "../models/eventModel";
import { asyncHandler } from "../utils/asyncHandler";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Check payment status and get user details
export const checkPaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, userId } = req.query;
    console.log(eventId, userId);

    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, "Event not found");
    console.log(event);

    // Find user in the includedInSplit array
    const userInSplit = event.includedInSplit.find(
      (item) => item._id?.toString() === userId || item._id === userId
    );

    if (!userInSplit) {
      throw new ApiError(400, "User not found in event split");
    }

    return res.status(200).json({
      success: true,
      status: userInSplit.status,
      amount: userInSplit.amount || 0,
      userDetails: {
        name: userInSplit.name || "User",
        email: userInSplit.email || "",
        status: userInSplit.status,
        amount: userInSplit.amount || 0,
        joinedAt: userInSplit.joinedAt,
      },
    });
  }
);

// Create Razorpay order
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, userId, amount } = req.body;

  if (!eventId || !userId) {
    throw new ApiError(400, "Missing required parameters");
  }


  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  // Find user in the includedInSplit array
  const userInSplit = event.includedInSplit.find(
    (item) => item._id?.toString() === userId || item._id === userId
  );

  if (!userInSplit) {
    throw new ApiError(400, "User not found in event split");
  }

  // Use the amount from the request or fallback to the amount in the database
  const paymentAmount = amount || userInSplit.amount || 0;

  if (paymentAmount <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  // Convert amount to paisa (Razorpay uses smallest currency unit)
  const amountInPaisa = Math.round(paymentAmount * 100);

  const options = {
    amount: amountInPaisa,
    currency: "INR",
    receipt: `receipt_${userId}`,
    notes: {
      eventId: eventId,
      userId: userId,
      userName: userInSplit.name || "User",
    },
  };

  try {
    const order = await razorpay.orders.create(options);

    return res.status(201).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw new ApiError(500, "Failed to create payment order");
  }
});

// Verify Razorpay payment
export const verifyPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentId, orderId, signature, eventId, userId } = req.body;

    if (!paymentId || !orderId || !signature || !eventId || !userId) {
      throw new ApiError(400, "Missing required parameters");
    }

    // Verify signature
    const payload = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(payload)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new ApiError(400, "Invalid payment signature");
    }

    // Update user payment status in database
    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, "Event not found");

    // Find the user's index in the includedInSplit array
    const userIndex = event.includedInSplit.findIndex(
      (item) => item._id?.toString() === userId || item._id === userId
    );

    if (userIndex === -1) {
      throw new ApiError(400, "User not found in event split");
    }

    // Update the user's payment status
    event.includedInSplit[userIndex].status = "Paid";

    // Add paymentDetails field if it doesn't exist in schema
    const updateObj = {
      [`includedInSplit.${userIndex}.status`]: "Paid",
      [`includedInSplit.${userIndex}.paymentId`]: paymentId,
      [`includedInSplit.${userIndex}.paymentTimestamp`]: new Date(),
    };

    await Event.updateOne({ _id: eventId }, { $set: updateObj });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId,
      timestamp: new Date().toISOString(),
    });
  }
);
