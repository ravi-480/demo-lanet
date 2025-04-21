import { Router } from "express";
import {
  createEvent,
  fetchById,
  fetchEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventControllers";
import { uploadEventImage } from "../utils/Cloudinary";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);
router.post("/create-new-event", uploadEventImage, createEvent);
router.get("/", fetchEvents);
router.get("/:id", fetchById);
router.put("/updateEvent", uploadEventImage, updateEvent);
router.delete("/deleteEvent/:id", deleteEvent);

export default router;



