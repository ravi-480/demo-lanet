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
  getVendorById,
  getVendorResponse,
  contactVendor,
} from "../controllers/vendorController";

const router = Router();
router.get("/", getVendor);
router.post("/add", addVendors);
router.get("/event/:eventId", getVendorsByEvent);
router.get("/getByUser", authenticate, getByUser);
router.get("/:id", getVendorById);

// add to split
router.post("/addUserToSplit", addUserInSplit);

// remove vendor
router.delete("/remove-vendor/:id", removeAddedVendor);

router.post("/send-mail", sendMailToUser);

//  contact vendor route (handles both regular mail and negotiation)
router.post("/send-mail-toVendor", authenticate, contactVendor);

// remove added user for split
router.delete("/delete/addedInSplit", removeFromSplit);

// edit user from split
router.patch("/split/users/edituser", editUserInSplit);

// add manual expense
router.post("/addManualExpense", addManualExpense);
router.post("/response", getVendorResponse);
export default router;
