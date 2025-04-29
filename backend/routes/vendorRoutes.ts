import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";

import {
  addUserInSplit,
  addVendors,
  getByUser,
  getVendor,
  getVendorsByEvent,
  removeAddedVendor,
  sendMailToUser,
  removeFromSplit,
  editUserInSplit,
  addManualExpense,
} from "../controllers/vendorController";

const router = Router();
router.use(authenticate);
router.get("/", getVendor);
router.post("/add", addVendors);
router.get("/event/:eventId", getVendorsByEvent);
router.get("/getByUser", authenticate, getByUser);

// add to split
router.post("/addUserToSplit", addUserInSplit);

// remove vendor
router.delete("/remove-vendor/:id", removeAddedVendor);

// send mail route

router.post("/send-mail", sendMailToUser);

// remove added user for split
router.delete("/delete/addedInSplit", removeFromSplit);

// edit user from split
router.patch("/split/users/edituser", editUserInSplit);

// add manual expense
router.post("/addManualExpense", addManualExpense);

export default router;
