import { Router } from "express";
import {
  addGuestFromFile,
  getUserByEventId,
  addSingleGuest,
  removeSingleGuest,
  updateGuest,
} from "../controllers/rsvpController";
import { upload } from "../middleware/uploadMiddleware";
const router = Router();

router.post("/upload-guest-excel", upload.single("file"), addGuestFromFile);
router.get("/:eventId", getUserByEventId);
router.post("/addSingleGuest", addSingleGuest);
router.delete("/removeSingleGuest", removeSingleGuest);
router.put("/:eventId/:guestId", updateGuest);
export default router;
