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
exports.addManualExpense = exports.editUserInSplit = exports.removeFromSplit = exports.checkPaymentStatus = exports.confirmPayment = exports.removeAddedVendor = exports.sendMailToUser = exports.addUserInSplit = exports.addVendorInSplitOrRemove = exports.getByUser = exports.getVendorsByEvent = exports.addVendors = exports.getVendor = void 0;
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const asyncHandler_1 = require("../utils/asyncHandler");
const emailService_1 = require("../utils/emailService");
const uuid_1 = require("uuid");
const axios = require("axios");
exports.getVendor = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query, location, page = 1 } = req.query;
    if (!query || !location) {
        return res
            .status(400)
            .json({ success: false, error: "Missing query or location" });
    }
    if (!process.env.SERPAPI_KEY) {
        throw new Error("Missing SerpAPI key in environment variables");
    }
    const serpRes = yield axios.get("https://serpapi.com/search.json", {
        params: {
            engine: "google_local",
            q: query,
            location,
            api_key: process.env.SERPAPI_KEY,
        },
    });
    const allVendors = serpRes.data.local_results || [];
    const perPage = 6;
    const pageNum = parseInt(page) || 1;
    const startIdx = (pageNum - 1) * perPage;
    const paginated = allVendors.slice(startIdx, startIdx + perPage);
    res.json({
        vendors: paginated,
        pagination: {
            currentPage: pageNum,
            perPage,
            hasMore: startIdx + perPage < allVendors.length,
        },
    });
}));
const addVendors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendorData = req.body;
        const existing = yield vendorModel_1.default.findOne({ placeId: vendorData.placeId });
        if (existing) {
            res.status(400).json({ success: false, message: "Vendor already added" });
            return;
        }
        const vendor = yield vendorModel_1.default.create(vendorData);
        // Find the related event and cast as EventDocument
        const event = yield eventModel_1.default.findById(vendor.event);
        if (!event) {
            res
                .status(404)
                .json({ success: false, message: "Associated event not found" });
            return;
        }
        // Update the event budget
        event.budget.spent += vendor.price;
        yield event.save();
        res
            .status(201)
            .json({ sucess: true, message: "Vendor added successfully", vendor });
    }
    catch (err) {
        console.error("Vendor creation failed:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create vendor",
            error: err.message,
        });
    }
});
exports.addVendors = addVendors;
exports.getVendorsByEvent = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.params;
    const { includeSplit } = req.query;
    const query = { event: eventId };
    if (includeSplit === "true") {
        query.isIncludedInSplit = true;
    }
    const vendors = yield vendorModel_1.default.find(query);
    res.json(vendors);
}));
exports.getByUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let reqUser = req;
    const userId = reqUser.user.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: "unauthorized" });
    }
    const vendors = yield vendorModel_1.default.find({ addedBy: userId }).sort({
        createdAt: -1,
    });
    if (!vendors) {
        return res
            .status(404)
            .json({ success: false, message: "no vendors found" });
    }
    return res.status(200).json(vendors);
}));
// add vendor in split
exports.addVendorInSplitOrRemove = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorId } = req.body;
    const vendor = yield vendorModel_1.default.findById(vendorId);
    if (!vendor)
        return res.status(404).json({ message: "Event not found" });
    vendor.isIncludedInSplit = !vendor.isIncludedInSplit;
    yield vendor.save();
    res.status(200).json({
        status: "success",
        message: "Vendor added in split successfully",
    });
}));
// add user in split
exports.addUserInSplit = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, user } = req.body;
    const event = yield eventModel_1.default.findById(id);
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }
    // Check if user with same email already exists
    const alreadyIncluded = event.includedInSplit.some((u) => u.email === user.email);
    if (alreadyIncluded) {
        return res
            .status(400)
            .json({ message: "User already included in split" });
    }
    event.includedInSplit.push(user);
    yield event.save();
    return res.status(200).json({
        success: true,
        message: "User added in split successfully",
    });
}));
// send mail to users
exports.sendMailToUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recipients, amounts, eventId, userId } = req.body;
    try {
        for (let i = 0; i < recipients.length; i++) {
            yield (0, emailService_1.sendEmail)({
                to: recipients[i],
                subject: "Split Expense Request",
                text: "",
                html: `
      <h3>Hello from Split App</h3>
      <p>You’ve been asked to confirm a split expense of <strong>₹${amounts[i]}</strong>.</p>
      <p>
    <a href="http://localhost:3000/split/confirm?eventId=${eventId[i]}&userId=${userId[i]}"
       style="background-color:#0ea5e9;padding:10px 20px;color:white;text-decoration:none;border-radius:5px;">
      Confirm Your Share
    </a>
        </a>
      </p>
    `,
            });
        }
        res.status(200).json({ message: "Emails sent successfully!" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send emails." });
    }
}));
// remove added vendors
exports.removeAddedVendor = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ message: "Vendor ID is required" });
    // Find and delete the vendor
    const vendor = yield vendorModel_1.default.findByIdAndDelete(id);
    if (!vendor)
        return res
            .status(404)
            .json({ success: false, message: "Vendor not found" });
    // Subtract the price from the event's spent budget
    const updatedEvent = yield eventModel_1.default.findByIdAndUpdate(vendor.event, { $inc: { "budget.spent": -vendor.price } }, { new: true });
    if (!updatedEvent)
        return res
            .status(404)
            .json({ success: false, message: "Event not found" });
    return res.status(200).json({
        success: true,
        message: "Vendor removed successfully and budget updated!",
    });
}));
// confirm payment request
exports.confirmPayment = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId, userId } = req.body;
    const event = yield eventModel_1.default.findById(eventId);
    if (!event) {
        return res
            .status(404)
            .json({ success: false, message: "Event not found" });
    }
    const user = event === null || event === void 0 ? void 0 : event.includedInSplit.find((item) => { var _a; return ((_a = item._id) === null || _a === void 0 ? void 0 : _a.toString()) == userId; });
    if (!user) {
        return res
            .status(404)
            .json({ success: "failed", message: "Invalid User Id" });
    }
    user.status = "Paid";
    yield event.save();
    return res
        .status(200)
        .json({ success: true, message: "User Paid Successfully" });
}));
// check payment status
exports.checkPaymentStatus = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId, userId } = req.query;
    const event = yield eventModel_1.default.findById(eventId);
    if (!event)
        return res.status(404).json({ message: "Event not found" });
    const user = event === null || event === void 0 ? void 0 : event.includedInSplit.find((item) => { var _a; return ((_a = item._id) === null || _a === void 0 ? void 0 : _a.toString()) == userId; });
    if (!user) {
        return res
            .status(404)
            .json({ success: false, message: "Invalid User Id" });
    }
    return res.status(200).json({ success: true, status: user.status });
}));
// delete added user in split
exports.removeFromSplit = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, id } = req.body;
    const event = yield eventModel_1.default.findById(id);
    if (!event)
        return res.status(404).json({ message: "Event not found" });
    event.includedInSplit = event === null || event === void 0 ? void 0 : event.includedInSplit.filter((person) => person._id.toString() !== userId);
    yield event.save();
    return res.status(200).json({
        success: true,
        message: "User deleted successfully from split",
    });
}));
exports.editUserInSplit = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, id } = req.body;
    if (!user || !id) {
        res.status(400);
        throw new Error("Missing required fields: user details or event ID");
    }
    try {
        const event = yield eventModel_1.default.findById(id);
        if (!event) {
            res.status(404);
            throw new Error("Event not found");
        }
        // Find the user in the includedInSplit array
        const userIndex = event.includedInSplit.findIndex((u) => u._id.toString() === user._id);
        if (userIndex === -1) {
            res.status(404);
            throw new Error("User not found in split");
        }
        // Update the user details
        event.includedInSplit[userIndex].name = user.name;
        event.includedInSplit[userIndex].email = user.email;
        yield event.save();
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: event.includedInSplit[userIndex],
        });
    }
    catch (error) {
        res.status(500);
        throw new Error(error.message || "Failed to update user");
    }
}));
// add manual expense
exports.addManualExpense = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, price, status, eventId, pricingUnit } = req.body;
        console.log(req.body);
        if (!title || !price || !status || !eventId || !pricingUnit) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }
        const priceAsNumber = Number(price);
        // Find the event
        const event = yield eventModel_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Associated event not found",
            });
        }
        const addedBy = event.creator;
        if (!addedBy) {
            return res.status(500).json({
                success: false,
                message: "Event creator not found",
            });
        }
        const randomPlaceId = (0, uuid_1.v4)();
        const manualVendor = yield vendorModel_1.default.create({
            title,
            price: priceAsNumber,
            category: status,
            pricingUnit,
            event: eventId,
            placeId: randomPlaceId,
            addedBy,
            isIncludedInSplit: false,
        });
        // Update event budget
        event.budget.spent += priceAsNumber;
        yield event.save();
        res.status(201).json({
            success: true,
            message: "Manual expense added successfully",
            vendor: manualVendor,
        });
    }
    catch (error) {
        console.error("Error adding manual expense:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add manual expense",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}));
