"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const router = (0, express_1.Router)();
// Create a new notification
router.post("/", notificationController_1.createNewNotification);
// Get notifications for a user
router.get("/", notificationController_1.getNotificationForUser);
// mark all as read
router.patch("/mark-all-read", notificationController_1.markAllRead);
exports.default = router;
