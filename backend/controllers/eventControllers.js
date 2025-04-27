"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.fetchById = exports.fetchEvents = exports.createEvent = void 0;
const eventModel_1 = __importDefault(require("../models/eventModel"));
const asyncHandler_1 = require("../utils/asyncHandler");
const eventBuild_1 = require("../utils/eventBuild");
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.createEvent = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.id) {
        throw new ApiError_1.default(401, "Unauthorized: User not authenticated");
    }
    const requiredFields = [
        "name",
        "date",
        "location",
        "description",
        "eventType",
    ];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            throw new ApiError_1.default(400, `Missing field,:${field}`);
        }
    }
    const eventDate = new Date(req.body.date);
    if (isNaN(eventDate.getTime())) {
        throw new ApiError_1.default(400, "Invalid date format");
    }
    let image = "";
    if (req.file) {
        try {
            image = yield (0, eventBuild_1.uploadImageToCloudinary)(req.file);
        }
        catch (error) {
            throw new ApiError_1.default(500, "failed to upload image");
        }
    }
    const eventData = (0, eventBuild_1.buildEventData)(req.body, image, req.user.id);
    try {
        const newEvent = yield eventModel_1.default.create(eventData);
        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: newEvent,
        });
    }
    catch (error) {
        console.log(error);
        throw new ApiError_1.default(500, "Error in creating events");
    }
}));
// fetch all events
const fetchEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.user);
        if (!req.user) {
            res
                .status(401)
                .json({ success: false, message: "Unauthorized - No user data" });
            return;
        }
        // Now safely access req.user.id
        const userId = req.user.id;
        if (!userId) {
            res
                .status(401)
                .json({ success: false, message: "Unauthorized - Invalid user ID" });
            return;
        }
        // Fetch only events created by this user
        const events = yield eventModel_1.default.find({ creator: userId })
            .sort({ date: 1 })
            .lean();
        res.status(200).json({ success: true, events });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch events",
        });
    }
});
exports.fetchEvents = fetchEvents;
// fetch events by id
exports.fetchById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("helloooooooooo");
        const eventId = req.params.id;
        console.log(eventId);
        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Event ID is required",
            });
        }
        // Validate MongoDB ObjectId format
        if (!mongoose_1.default.Types.ObjectId.isValid(eventId)) {
            return res.status(404).json({
                success: false,
                message: "Invalid event ID format or Event Not Found",
            });
        }
        const event = yield eventModel_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event Not Found",
            });
        }
        return res.status(200).json({ success: true, event });
    }
    catch (error) {
        console.error("Event fetch error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch Event",
            error: error.message,
        });
    }
}));
// edit event
exports.updateEvent = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.body;
    if (!eventId) {
        throw new ApiError_1.default(400, "Missing EventID");
    }
    let image = "";
    if (req.file) {
        try {
            image = yield (0, eventBuild_1.uploadImageToCloudinary)(req.file);
        }
        catch (error) {
            throw new ApiError_1.default(500, "Failed to upload image");
        }
    }
    const updatedData = (0, eventBuild_1.buildEventData)(req.body, image || undefined);
    try {
        const updatedEvent = yield eventModel_1.default.findByIdAndUpdate(eventId, updatedData, {
            new: true,
        });
        if (!updatedEvent) {
            throw new ApiError_1.default(404, "Event not found");
        }
        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
        });
    }
    catch (error) {
        throw new ApiError_1.default(500, "Failed to update data");
    }
}));
// deleting an event
exports.deleteEvent = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        throw new ApiError_1.default(400, "Missing EventID");
    const deletedEvent = yield eventModel_1.default.findByIdAndDelete(id);
    const deletedVendor = yield vendorModel_1.default.deleteMany({ event: id });
    if (!deletedEvent && !deletedVendor)
        throw new ApiError_1.default(500, "Failed to delete an event");
    return res
        .status(201)
        .json({ success: true, message: "Event Deleted successfully" });
}));
