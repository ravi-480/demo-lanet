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
  checkPaymentStatus,
  removeFromSplit,
  editUserInSplit
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
router.delete("/remove-vendor/:id", removeAddedVendor);

// send mail rout

router.post("/send-mail", sendMailToUser);

// confirm payment request

router.post("/confirm-payment", confirmPayment);

// confirm status

router.get("/payment-status", checkPaymentStatus);

// remove added user for split
router.delete("/delete/addedInSplit", removeFromSplit);

// edit user from split

router.patch("/split/users/edituser",editUserInSplit);

export default router;
