import mongoose, { Schema, Document } from "mongoose";
import { IEvent } from "../Interfaces/event.interface";

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

    noOfGuestAdded: {
      type: Number,
      default: 0,
    },

    includedInSplit: {
      type: [
        {
          status: {
            type: String,
            default: "pending",
            enum: ["pending", "Paid", "declined"],
          },
          name: String,
          email: String,
          amount: { type: Number, default: 0 },
          joinedAt: { type: Date, default: Date.now },
          paymentId: { type: String, default: null },
          paymentTimestamp: { type: Date, default: null },
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
