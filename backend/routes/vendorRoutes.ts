import { Router } from "express";
import {
  addVendors,
  getVendor,
  getVendorsByEvent,
} from "../controllers/vendorController";

const router = Router();

router.get("/", getVendor);
router.post("/add", addVendors);
router.get("/event/:eventId", getVendorsByEvent);

export default router;
