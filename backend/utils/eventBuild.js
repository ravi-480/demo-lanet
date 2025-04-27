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
exports.uploadImageToCloudinary = exports.buildEventData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("cloudinary");
const buildEventData = (body, image, userId) => {
    const { name, date, location, description, budget, guestLimit, eventType, durationInDays, } = body;
    return Object.assign({ name, date: new Date(date), location,
        description,
        image,
        eventType, durationInDays: Number(durationInDays) || 1, guestLimit: Number(guestLimit) || 0, noOfGuestAdded: 0, budget: {
            allocated: Number(budget) || 0,
            spent: 0,
        } }, (userId && {
        creator: new mongoose_1.default.Types.ObjectId(userId),
        // status: "upcoming",
        vendorsInSplit: [],
        includedInSplit: [],
    }));
};
exports.buildEventData = buildEventData;
const uploadImageToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const result = yield cloudinary_1.v2.uploader.upload(dataURI, {
        folder: "events",
        resource_type: "image",
    });
    return result.secure_url;
});
exports.uploadImageToCloudinary = uploadImageToCloudinary;
