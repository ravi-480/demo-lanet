import mongoose, { Schema, Document } from "mongoose";
import { IEvent } from "../interfaces/user.interface";

export interface EventDocument extends Omit<Document, "id">, IEvent {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: null },

    budget: {
      type: new mongoose.Schema(
        {
          allocated: { type: Number, required: true, min: 0 },
          spent: { type: Number, default: 0, min: 0 },
        },
        { _id: false }
      ),
    },

    guestLimit: {
      type: Number,
      required: true,
      min: 0,
    },

    // ✅ Fix field name to match your usage
    noOfGuestAdded: {
      type: Number,
      default: 0,
    },

    // ✅ Add this
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },

    // ✅ Add this
    vendorsInSplit: {
      type: [Schema.Types.ObjectId],
      ref: "Vendor",
      default: [],
    },

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
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

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

const Event = mongoose.model<EventDocument>("Event", eventSchema);
export default Event;
