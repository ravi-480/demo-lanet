import { Router } from "express";
import {
  createEvent,
  fetchById,
  fetchEvents,
  updateEvent,
  deleteEvent,
  adjustEventBudget,
} from "../controllers/eventControllers";
import { uploadEventImage } from "../utils/Cloudinary";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/create-new-event", authenticate, uploadEventImage, createEvent);
router.get("/", authenticate, fetchEvents);
router.post("/:id/adjustBudget", authenticate, adjustEventBudget);
router.get("/:id", fetchById);
router.put("/updateEvent/:id", authenticate, uploadEventImage, updateEvent);
router.delete("/deleteEvent/:id", authenticate, deleteEvent);

export default router;
