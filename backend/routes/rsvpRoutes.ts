import { Router } from "express";
import {
  addGuestFromFile,
  getUserByEventId,
  addSingleGuest,
  removeSingleGuest,
  updateGuest,
  inviteAllGuest,
  validateUrl,
  responseInvite,
  sendReminder,
  removeAllGuestOrVendor,
} from "../controllers/rsvpController";
import { upload } from "../middleware/uploadMiddleware";
import { authenticate } from "../middleware/authMiddleware";
const router = Router();

router.post(
  "/upload-guest-excel",
  authenticate,
  upload.single("file"),
  addGuestFromFile
);
router.get("/:eventId", authenticate, getUserByEventId);
router.post("/addSingleGuest", authenticate, addSingleGuest);
router.delete("/removeSingleGuest", authenticate, removeSingleGuest);
router.put("/:eventId/:guestId", authenticate, updateGuest);
router.post("/inviteAll", authenticate, inviteAllGuest);
router.post("/rsvp/respond", responseInvite);
router.post("/sendReminder", authenticate, sendReminder);
router.delete("/removeAllGuestOrVendor", authenticate, removeAllGuestOrVendor);
router.get("/rsvp/validate", validateUrl);
export default router;
