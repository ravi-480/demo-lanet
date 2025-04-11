import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";

import {
  addVendorInSplit,
  addUserInSplit,
  addVendors,
  getByUser,
  getVendor,
  getVendorsByEvent,
  removeAddedVendor,
  sendMailToUser,
  confirmPayment,
  checkPaymentStatus
} from "../controllers/vendorController";

const router = Router();

router.get("/", getVendor);
router.post("/add", addVendors);
router.get("/event/:eventId", getVendorsByEvent);
router.get("/getByUser", authenticate, getByUser);

// add to split
router.post("/addToSplit", addVendorInSplit);
router.post("/addUserToSplit", addUserInSplit);

// remove vendor
router.delete("/remove-vendor/:id",removeAddedVendor);

// send mail rout

router.post("/send-mail", sendMailToUser);

// confirm payment request

router.post("/confirm-payment",confirmPayment)

// confirm status

router.get("/payment-status",checkPaymentStatus)

export default router;
