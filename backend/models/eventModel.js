"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const eventSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    budget: {
        type: new mongoose_1.default.Schema({
            allocated: { type: Number, required: true, min: 0 },
            spent: { type: Number, default: 0, min: 0 },
        }, { _id: false }),
    },
    guestLimit: {
        type: Number,
        required: true,
        min: 0,
    },
    noOfGuestAdded: {
        type: Number,
        default: 0,
    },
    // status: {
    //   type: String,
    //   enum: ["upcoming", "completed", "cancelled"],
    //   default: "upcoming",
    // },
    includedInSplit: {
        type: [
            {
                status: { type: String, default: "pending" },
                name: String,
                email: String,
                joinedAt: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    eventType: {
        type: String,
        required: true,
        trim: true,
    },
    durationInDays: {
        type: Number,
        required: true,
        min: 1,
    },
}, { timestamps: true });
eventSchema.pre("save", function (next) {
    // Handle the case where budget might come in as a plain number
    if (this.isNew && typeof this.budget === "number") {
        const budgetValue = this.budget;
        this.budget = {
            allocated: budgetValue,
            spent: 0,
        };
    }
    next();
});
// Indexes for optimizing queries
eventSchema.index({ creator: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
const Event = mongoose_1.default.model("Event", eventSchema);
exports.default = Event;
