import { Router } from "express";
import {
  addGuestFromFile,
  getUserByEventId,
} from "../controllers/rsvpController";
import { upload } from "../middleware/uploadMiddleware";
const router = Router();

router.post("/upload-guest-excel", upload.single("file"), addGuestFromFile);
router.get("/:eventId", getUserByEventId);

export default router;
