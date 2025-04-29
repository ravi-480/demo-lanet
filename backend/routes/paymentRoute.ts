import express from "express";
import {
  createOrder,
  verifyPayment,
  checkPaymentStatus,
} from "../controllers/paymentController";

const router = express.Router();

// Razorpay payment routes
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/verify-status", checkPaymentStatus);

export default router;
