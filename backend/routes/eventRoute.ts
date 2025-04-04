import { Router } from "express";
import { createEvent, fetchEvents } from "../controllers/eventControllers";
import { uploadEventImage } from "../utils/Cloudinary";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, uploadEventImage, createEvent);
router.get("/", fetchEvents);

export default router;
