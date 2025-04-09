import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";

import {
  addVendorInSplit,
  addUserInSplit,
  addVendors,
  getByUser,
  getVendor,
  getVendorsByEvent,
  sendMailToUser
} from "../controllers/vendorController";

const router = Router();

router.get("/", getVendor);
router.post("/add", addVendors);
router.get("/event/:eventId", getVendorsByEvent);
router.get("/getByUser", authenticate, getByUser);

// add to split
router.post("/addToSplit", addVendorInSplit);
router.post("/addUserToSplit",addUserInSplit)

// send mail rout

router.post("/send-mail",sendMailToUser)

export default router;
