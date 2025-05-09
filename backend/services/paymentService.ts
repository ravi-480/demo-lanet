import Razorpay from "razorpay";
import crypto from "crypto";
import Event from "../models/eventModel";
import ApiError from "../utils/ApiError";
import {
  CheckPaymentQuery,
  CreateOrderBody,
  VerifyPaymentBody,
  CheckPaymentResponse,
  CreateOrderResponse,
  VerifyPaymentResponse,
} from "../Interfaces/payment.interface";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

class PaymentService {
  // Check payment status and get user details

  async checkPaymentStatus(
    query: CheckPaymentQuery
  ): Promise<CheckPaymentResponse> {
    const { eventId, userId } = query;

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

    return {
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
    };
  }

  // Create Razorpay order
  async createOrder(body: CreateOrderBody): Promise<CreateOrderResponse> {
    const { eventId, userId, amount } = body;

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
        eventId,
        userId,
        userName: userInSplit.name || "User",
      },
    };

    try {
      const order = await razorpay.orders.create(options);

      return {
        success: true,
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      };
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      throw new ApiError(500, "Failed to create payment order");
    }
  }

  // Verify Razorpay payment
  async verifyPayment(body: VerifyPaymentBody): Promise<VerifyPaymentResponse> {
    const { paymentId, orderId, signature, eventId, userId } = body;

    if (!paymentId || !orderId || !signature || !eventId || !userId) {
      throw new ApiError(400, "Missing required parameters");
    }

    // Verify signature
    const isValid = this.validatePaymentSignature(
      orderId,
      paymentId,
      signature
    );
    if (!isValid) {
      throw new ApiError(400, "Invalid payment signature");
    }

    // Update user payment status in database
    await this.updatePaymentStatus(eventId, userId, paymentId);

    return {
      success: true,
      message: "Payment done successfully",
      paymentId,
      timestamp: new Date().toISOString(),
    };
  }

  //  Validate Razorpay payment signature
  private validatePaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const payload = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(payload)
      .digest("hex");

    return expectedSignature === signature;
  }

  // Update user payment status in database
  private async updatePaymentStatus(
    eventId: string,
    userId: string,
    paymentId: string
  ): Promise<void> {
    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, "Event not found");

    // Find the user's index in the includedInSplit array
    const userIndex = event.includedInSplit.findIndex(
      (item) => item._id?.toString() === userId || item._id === userId
    );

    if (userIndex === -1) {
      throw new ApiError(400, "User not found in event split");
    }

    // Update the user's payment status and payment details
    const updateObj = {
      [`includedInSplit.${userIndex}.status`]: "Paid",
      [`includedInSplit.${userIndex}.paymentId`]: paymentId,
      [`includedInSplit.${userIndex}.paymentTimestamp`]: new Date(),
    };

    await Event.updateOne({ _id: eventId }, { $set: updateObj });
  }
}

export default new PaymentService();
