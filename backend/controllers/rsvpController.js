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
exports.sendReminder = exports.responseInvite = exports.validateUrl = exports.inviteAllGuest = exports.updateGuest = exports.removeAllGuestOrVendor = exports.removeSingleGuest = exports.addSingleGuest = exports.getUserByEventId = exports.addGuestFromFile = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const xlsx_1 = __importDefault(require("xlsx"));
const rsvpSchema_1 = __importDefault(require("../models/rsvpSchema"));
const mongoose_1 = __importDefault(require("mongoose"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const emailService_1 = require("../utils/emailService");
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const helper_1 = require("../utils/helper");
const validateIdFormat = (id) => {
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
exports.addGuestFromFile = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { eventId } = req.body;
        const file = req.file;
        if (!file) {
            return res
                .status(400)
                .json({ success: false, message: "File not uploaded" });
        }
        if (!validateIdFormat(eventId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Event ID" });
        }
        const event = yield eventModel_1.default.findById(eventId);
        if (!event) {
            return res
                .status(404)
                .json({ success: false, message: "Event not found" });
        }
        // Process the Excel file
        const workBook = xlsx_1.default.read(file.buffer, { type: "buffer" });
        const sheet = workBook.Sheets[workBook.SheetNames[0]];
        const guests = xlsx_1.default.utils.sheet_to_json(sheet);
        if (!Array.isArray(guests) || guests.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: "No data found in file" });
        }
        // Get existing guests and create a set of emails for quick lookup
        const existingGuests = yield rsvpSchema_1.default.find({ eventId });
        const existingEmails = new Set(existingGuests.map((g) => g.email.toLowerCase()));
        // Process new guests, skipping duplicates
        const newGuests = [];
        let duplicateCount = 0;
        for (const guest of guests) {
            const guestObj = guest;
            const email = (guestObj.email || "nomail@gmail.com").toLowerCase();
            if (existingEmails.has(email)) {
                duplicateCount++;
            }
            else {
                newGuests.push({
                    name: guestObj.name || "unknown",
                    email,
                    status: "Pending",
                    eventId,
                });
                existingEmails.add(email); // Prevent duplicates within the current upload
            }
        }
        // Bulk insert new guests if any
        if (newGuests.length > 0) {
            yield rsvpSchema_1.default.insertMany(newGuests);
        }
        // Get total guests and calculate if over limit
        const totalGuests = existingGuests.length + newGuests.length;
        const previousGuestCount = event.noOfGuestAdded || 0;
        const guestLimit = event.guestLimit || 0;
        // Calculate guests over limit
        const guestsOverLimit = Math.max(0, totalGuests - guestLimit);
        // This is used for per-plate pricing adjustments
        const previousGuestsOverLimit = Math.max(0, previousGuestCount - guestLimit);
        const newGuestsOverLimit = guestsOverLimit - previousGuestsOverLimit;
        console.log({
            previousGuestCount,
            guestLimit,
            totalGuests,
            guestsOverLimit,
            previousGuestsOverLimit,
            newGuestsOverLimit,
        });
        // Track total additional cost for budget updates
        let totalAdditionalCost = 0;
        // Only update per-plate vendors if there are new guests over the limit
        if (newGuestsOverLimit > 0) {
            const vendors = yield vendorModel_1.default.find({
                event: eventId,
                pricingUnit: "per plate",
            });
            if (vendors.length > 0) {
                const vendorUpdates = vendors.map((vendor) => {
                    const perPlatePrice = (vendor.price || 0) / (vendor.numberOfGuests || 1);
                    // Only update pricing for the additional guests over limit
                    const additionalCost = perPlatePrice * newGuestsOverLimit;
                    const newPrice = vendor.price + additionalCost;
                    const newGuestCount = vendor.numberOfGuests + newGuestsOverLimit;
                    // Add to total additional cost for budget update
                    totalAdditionalCost += additionalCost;
                    return vendorModel_1.default.findByIdAndUpdate(vendor._id, {
                        price: newPrice,
                        numberOfGuests: newGuestCount,
                    });
                });
                yield Promise.all(vendorUpdates);
            }
        }
        // Update event with total guest count and budget spent
        const updateData = { noOfGuestAdded: totalGuests };
        // Only update budget if there's an additional cost
        if (totalAdditionalCost > 0) {
            // Calculate the new budget spent amount
            const currentBudgetSpent = ((_a = event.budget) === null || _a === void 0 ? void 0 : _a.spent) || 0;
            const newBudgetSpent = currentBudgetSpent + totalAdditionalCost;
            // Update the budget spent field
            updateData["budget.spent"] = newBudgetSpent;
        }
        yield eventModel_1.default.findByIdAndUpdate(eventId, updateData);
        // Send notification if guest limit exceeded
        if (guestsOverLimit > 0) {
            const message = `Guest limit exceeded by ${guestsOverLimit}. Total: ${totalGuests}, Limit: ${guestLimit}`;
            yield (0, helper_1.createNotification)(event.creator.toString(), eventId, message, "warning", {
                eventTitle: event.name || "Event",
                currentGuestCount: totalGuests,
                guestLimit,
                guestsOverLimit,
            });
        }
        return res.status(201).json(Object.assign(Object.assign({ success: true, message: `Guests added: ${newGuests.length}, Duplicates skipped: ${duplicateCount}`, totalGuests }, (guestsOverLimit > 0 && {
            guestsOverLimit,
            newGuestsOverLimit,
        })), (newGuestsOverLimit > 0 && {
            vendorsUpdated: true,
            pricingUpdatedForGuests: newGuestsOverLimit,
            budgetUpdated: totalAdditionalCost > 0,
            additionalCost: totalAdditionalCost,
        })));
    }
    catch (error) {
        console.error("Error in addGuestFromFile:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}));
// Get Guests by Event ID
exports.getUserByEventId = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        if (!validateIdFormat(eventId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Event ID" });
        }
        const rsvpList = yield rsvpSchema_1.default.find({ eventId });
        if (!rsvpList || rsvpList.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "No guests found" });
        }
        return res.status(200).json({
            success: true,
            message: "Guests fetched successfully",
            rsvpList,
        });
    }
    catch (error) {
        console.error("Error in getUserByEventId:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}));
// Add single guest manually
exports.addSingleGuest = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { eventId } = req.body;
        if (!validateIdFormat(eventId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Event ID" });
        }
        console.log(req.body);
        const existingGuest = yield rsvpSchema_1.default.findOne({
            eventId,
            email: req.body.email,
        });
        if (existingGuest) {
            return res.status(400).json({
                success: false,
                message: "A guest with this email is already added to the event.",
            });
        }
        // Get event details first
        const event = yield eventModel_1.default.findById(eventId);
        if (!event) {
            return res
                .status(404)
                .json({ success: false, message: "Event not found" });
        }
        const currentGuestCount = event.noOfGuestAdded || 0;
        const newGuestCount = currentGuestCount + 1;
        const guestLimit = event.guestLimit || 0;
        // Create the guest
        const guest = yield rsvpSchema_1.default.create(req.body);
        // Update event guest count
        yield eventModel_1.default.findByIdAndUpdate(eventId, {
            $inc: { noOfGuestAdded: 1 },
        });
        // Check for per-plate vendors that need price updates
        const cateringVendors = yield vendorModel_1.default.find({
            event: eventId,
            pricingUnit: "per plate",
        });
        // Track total additional cost for budget updates
        let totalAdditionalCost = 0;
        const updatedVendors = [];
        // Process each vendor
        for (const vendor of cateringVendors) {
            // Calculate price per plate based on current settings
            const perPlatePrice = vendor.price / vendor.numberOfGuests;
            // Update the vendor with new guest count and price
            const updatedPrice = vendor.price + perPlatePrice;
            yield vendorModel_1.default.findByIdAndUpdate(vendor._id, {
                price: updatedPrice,
                numberOfGuests: vendor.numberOfGuests + 1,
            });
            // Track price increase for budget update
            totalAdditionalCost += perPlatePrice;
            updatedVendors.push({
                id: vendor._id,
                title: vendor.title,
                priceIncrease: perPlatePrice,
                newPrice: updatedPrice,
            });
        }
        // Update event budget spent if there's additional cost
        if (totalAdditionalCost > 0) {
            const currentBudgetSpent = ((_a = event.budget) === null || _a === void 0 ? void 0 : _a.spent) || 0;
            const newBudgetSpent = currentBudgetSpent + totalAdditionalCost;
            yield eventModel_1.default.findByIdAndUpdate(eventId, { "budget.spent": newBudgetSpent }, { new: true });
        }
        // Check if guest limit is exceeded
        let guestLimitExceeded = false;
        if (guestLimit > 0 && newGuestCount > guestLimit) {
            guestLimitExceeded = true;
            // Create notification for exceeding guest limit
            const message = `Guest limit exceeded. Total: ${newGuestCount}, Limit: ${guestLimit}`;
            yield (0, helper_1.createNotification)(event.creator.toString(), eventId, message, "warning", {
                eventTitle: event.name || "Event",
                currentGuestCount: newGuestCount,
                guestLimit,
                guestsOverLimit: newGuestCount - guestLimit,
            });
        }
        return res.status(201).json({
            success: true,
            message: "Guest added successfully",
            guest,
            vendorsUpdated: updatedVendors.length > 0,
            updatedVendors: updatedVendors.length > 0 ? updatedVendors : undefined,
            budgetUpdated: totalAdditionalCost > 0,
            additionalCost: totalAdditionalCost,
            guestLimitExceeded,
        });
    }
    catch (error) {
        console.error("Error adding guest:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}));
exports.removeSingleGuest = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { guestId } = req.query;
        if (!validateIdFormat(guestId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Guest ID" });
        }
        const guest = yield rsvpSchema_1.default.findById(guestId);
        if (!guest) {
            return res
                .status(404)
                .json({ success: false, message: "Guest not found" });
        }
        const event = yield eventModel_1.default.findById(guest.eventId);
        if (!event) {
            return res
                .status(404)
                .json({ success: false, message: "Associated event not found" });
        }
        const updatedGuestCount = event.noOfGuestAdded - 1;
        const cateringVendors = yield vendorModel_1.default.find({
            event: guest.eventId,
            pricingUnit: "per plate",
        });
        yield rsvpSchema_1.default.findByIdAndDelete(guestId);
        yield eventModel_1.default.findByIdAndUpdate(guest.eventId, { $inc: { noOfGuestAdded: -1 } }, { new: true });
        const violatingVendors = [];
        let totalBudgetReduction = 0;
        const updatePromises = cateringVendors.map((vendor) => __awaiter(void 0, void 0, void 0, function* () {
            if (vendor.minGuestLimit && updatedGuestCount < vendor.minGuestLimit) {
                // Vendor is violating the min guest requirement
                violatingVendors.push({
                    id: vendor._id,
                    title: vendor.title,
                    minGuestLimit: vendor.minGuestLimit,
                });
                return vendorModel_1.default.findByIdAndUpdate(vendor._id, { numberOfGuests: vendor.numberOfGuests }, // preserve original guest count
                { new: true });
            }
            else {
                const pricePerPlate = vendor.price / vendor.numberOfGuests;
                const newPrice = Math.round(pricePerPlate * updatedGuestCount);
                // Calculate budget reduction for this vendor
                const priceDifference = vendor.price - newPrice;
                totalBudgetReduction += priceDifference;
                return vendorModel_1.default.findByIdAndUpdate(vendor._id, {
                    price: newPrice,
                    numberOfGuests: updatedGuestCount,
                }, { new: true });
            }
        }));
        yield Promise.all(updatePromises);
        // Update the event's budget.spent if there was a price reduction
        if (totalBudgetReduction > 0) {
            const currentBudgetSpent = ((_a = event.budget) === null || _a === void 0 ? void 0 : _a.spent) || 0;
            const newBudgetSpent = Math.max(0, currentBudgetSpent - totalBudgetReduction);
            yield eventModel_1.default.findByIdAndUpdate(guest.eventId, { "budget.spent": newBudgetSpent }, { new: true });
        }
        if (violatingVendors.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Guest removed, but vendor budgets were preserved due to minimum guest limit.",
                violatingVendors,
                budgetUpdated: totalBudgetReduction > 0,
                budgetReduction: totalBudgetReduction,
            });
        }
        return res.status(200).json({
            success: true,
            message: "Guest removed successfully and vendor prices updated.",
            budgetUpdated: totalBudgetReduction > 0,
            budgetReduction: totalBudgetReduction,
        });
    }
    catch (error) {
        console.error("Error removing guest:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}));
exports.removeAllGuestOrVendor = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id, query } = req.body;
    if (!id || !query) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    console.log(query);
    if (query === "guest") {
        // Get event details first
        const event = yield eventModel_1.default.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const originalGuestCount = event.noOfGuestAdded || 0;
        const eventGuestLimit = event.guestLimit || 0;
        // Get all catering vendors
        const allCateringVendors = yield vendorModel_1.default.find({
            event: id,
            pricingUnit: "per plate",
        });
        // Track budget reduction from vendor price updates
        let totalBudgetReduction = 0;
        const preservedVendors = [];
        // Process all vendors
        for (const vendor of allCateringVendors) {
            const minGuestLimit = vendor.minGuestLimit || 0;
            if (minGuestLimit > 0) {
                // We need to respect the minimum guest limit
                // Calculate price per plate
                const pricePerPlate = vendor.price / vendor.numberOfGuests;
                // Calculate new guest count - either minGuestLimit or keep at 0
                const newGuestCount = minGuestLimit;
                // Calculate price reduction
                const priceReduction = pricePerPlate * (vendor.numberOfGuests - newGuestCount);
                totalBudgetReduction += priceReduction;
                // Update vendor to minGuestLimit instead of 0
                yield vendorModel_1.default.findByIdAndUpdate(vendor._id, {
                    numberOfGuests: newGuestCount,
                    price: vendor.price - priceReduction,
                });
                preservedVendors.push({
                    id: vendor._id,
                    title: vendor.title,
                    minGuestLimit,
                    adjustedPrice: vendor.price - priceReduction,
                });
            }
            else {
                // No minimum guest limit, reduce price to 0
                totalBudgetReduction += vendor.price;
                yield vendorModel_1.default.findByIdAndUpdate(vendor._id, {
                    numberOfGuests: 0,
                    price: 0,
                });
            }
        }
        // Delete all guests
        yield rsvpSchema_1.default.deleteMany({ eventId: id });
        yield eventModel_1.default.findByIdAndUpdate(id, { noOfGuestAdded: 0 });
        // Update the event's budget.spent if there was a price reduction
        if (totalBudgetReduction > 0) {
            const currentBudgetSpent = ((_a = event.budget) === null || _a === void 0 ? void 0 : _a.spent) || 0;
            const newBudgetSpent = Math.max(0, currentBudgetSpent - totalBudgetReduction);
            yield eventModel_1.default.findByIdAndUpdate(id, { "budget.spent": newBudgetSpent }, { new: true });
        }
        if (preservedVendors.length > 0) {
            return res.status(200).json({
                success: true,
                message: "All guests removed successfully. Some vendor prices were adjusted to minimum guest requirements.",
                preservedVendors,
                budgetUpdated: totalBudgetReduction > 0,
                budgetReduction: totalBudgetReduction,
            });
        }
        return res.status(200).json({
            success: true,
            message: "All guests removed successfully",
            budgetUpdated: totalBudgetReduction > 0,
            budgetReduction: totalBudgetReduction,
        });
    }
    if (query === "vendor") {
        // Get event details first
        const event = yield eventModel_1.default.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        // Get the total vendor costs before deletion
        const vendors = yield vendorModel_1.default.find({ event: id });
        const totalVendorCost = vendors.reduce((sum, vendor) => sum + (vendor.price || 0), 0);
        // Delete all vendors
        yield vendorModel_1.default.deleteMany({ event: id });
        // Update the event's budget.spent to reflect vendor removal
        if (totalVendorCost > 0) {
            const currentBudgetSpent = ((_b = event.budget) === null || _b === void 0 ? void 0 : _b.spent) || 0;
            const newBudgetSpent = Math.max(0, currentBudgetSpent - totalVendorCost);
            yield eventModel_1.default.findByIdAndUpdate(id, { "budget.spent": newBudgetSpent }, { new: true });
        }
        return res.status(200).json({
            success: true,
            message: "All vendors removed successfully",
            budgetUpdated: totalVendorCost > 0,
            budgetReduction: totalVendorCost,
        });
    }
    return res.status(400).json({ message: "Invalid query type" });
}));
exports.updateGuest = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, guestId } = req.params;
        const { name, email, status } = req.body;
        if (!name || !email || !status) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }
        if (!validateIdFormat(eventId) || !validateIdFormat(guestId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid ID format" });
        }
        const updatedGuest = yield rsvpSchema_1.default.findOneAndUpdate({ _id: guestId, eventId }, { name, email, status }, { new: true });
        if (!updatedGuest) {
            return res
                .status(404)
                .json({ success: false, message: "Guest not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Guest updated successfully",
            guest: updatedGuest,
        });
    }
    catch (error) {
        console.error("Error updating guest:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}));
// Send invitation emails to all guests
exports.inviteAllGuest = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guestData = req.body;
        if (!guestData || !Array.isArray(guestData) || guestData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No guest data provided",
            });
        }
        const eventId = guestData[0].eventId;
        if (!validateIdFormat(eventId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Event ID",
            });
        }
        const event = yield eventModel_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }
        // Send emails in batches to avoid overwhelming the email service
        const batchSize = 10;
        const emailPromises = [];
        for (let i = 0; i < guestData.length; i += batchSize) {
            const batch = guestData.slice(i, i + batchSize);
            const batchPromises = batch.map((guest) => (0, emailService_1.sendEmail)({
                to: guest.email,
                subject: `Invitation: ${event.name} - ${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}`,
                text: "",
                html: (0, helper_1.formatEmailTemplate)(event, guest),
            }));
            emailPromises.push(Promise.all(batchPromises));
            if (i + batchSize < guestData.length) {
                yield new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        yield Promise.all(emailPromises.flat());
        return res.status(200).json({
            success: true,
            message: `Invitations sent successfully to ${guestData.length} guests!`,
        });
    }
    catch (error) {
        console.error("Error sending invitations:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send invitations",
        });
    }
}));
exports.validateUrl = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, guestId } = req.query;
        if (!eventId || !guestId) {
            return res.status(400).json({
                success: false,
                message: "Missing eventId or guestId",
            });
        }
        if (!validateIdFormat(eventId) ||
            !validateIdFormat(guestId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid eventId or guestId format",
            });
        }
        // Fetch both event and guest in parallel
        const [event, guest] = yield Promise.all([
            eventModel_1.default.findById(eventId),
            rsvpSchema_1.default.findById(guestId),
        ]);
        if (!event || !guest) {
            return res.status(404).json({
                success: false,
                message: "Invalid RSVP link",
            });
        }
        return res.status(200).json({
            success: true,
            guest: {
                name: guest.name,
                email: guest.email,
                date: event.date,
                location: event.location,
                responseStatus: guest.status,
            },
        });
    }
    catch (error) {
        console.error("Error validating URL:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}));
// Submit guest response
exports.responseInvite = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { guestId, eventId, attending } = req.body;
        if (!guestId || !eventId) {
            return res.status(400).json({
                success: false,
                message: "Missing guestId or eventId",
            });
        }
        const guest = yield rsvpSchema_1.default.findById(guestId);
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: "Guest not found",
            });
        }
        // Update guest status
        const previousStatus = guest.status;
        guest.status = attending ? "Confirmed" : "Declined";
        yield guest.save();
        // Get the event and create notification in parallel
        const event = yield eventModel_1.default.findById(eventId);
        if (event) {
            const organizerId = event.creator.toString();
            const message = `${guest.name} has ${attending ? "accepted" : "declined"} your invitation to ${event.name || "your event"}.`;
            yield (0, helper_1.createNotification)(organizerId, eventId, message, "response", {
                guestId: guest._id.toString(),
                guestName: guest.name,
                response: guest.status,
                previousStatus,
                eventTitle: event.name || "Event",
            });
        }
        return res.status(200).json({
            success: true,
            message: `RSVP ${guest.status}`,
        });
    }
    catch (error) {
        console.error("Error processing RSVP response:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}));
// Send reminder email to guest
exports.sendReminder = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, name, email, _id: guestId } = req.body;
        if (!validateIdFormat(eventId) || !validateIdFormat(guestId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
            });
        }
        const event = yield eventModel_1.default.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }
        yield (0, emailService_1.sendEmail)({
            to: email,
            subject: `Reminder: ${event.name} - ${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}`,
            text: "",
            html: (0, helper_1.formatEmailTemplate)(event, { name, email, _id: guestId }, true),
        });
        return res.status(200).json({
            success: true,
            message: "Reminder email sent successfully",
        });
    }
    catch (error) {
        console.error("Error sending reminder:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send reminder",
        });
    }
}));
