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
  removeAllGuestOrVendor
} from "../controllers/rsvpController";
import { upload } from "../middleware/uploadMiddleware";
const router = Router();

router.post("/upload-guest-excel", upload.single("file"), addGuestFromFile);
router.get("/:eventId", getUserByEventId);
router.post("/addSingleGuest", addSingleGuest);
router.delete("/removeSingleGuest", removeSingleGuest);
router.put("/:eventId/:guestId", updateGuest);
router.post("/inviteAll",inviteAllGuest)
router.post("/rsvp/respond",responseInvite)
router.post("/sendReminder",sendReminder)
router.delete("/removeAllGuestOrVendor",removeAllGuestOrVendor)
// validate url
router.get("/rsvp/validate",validateUrl)
export default router;


