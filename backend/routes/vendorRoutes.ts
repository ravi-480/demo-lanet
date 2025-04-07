import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  addVendors,
  getByUser,
  getVendor,
  getVendorsByEvent,
} from "../controllers/vendorController";

const router = Router();

router.get("/", getVendor);
router.post("/add", addVendors);
router.get("/event/:eventId", getVendorsByEvent);
router.get("/getByUser", authenticate, getByUser);

export default router;
