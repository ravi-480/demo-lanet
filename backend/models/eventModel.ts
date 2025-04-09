import mongoose, { Schema, Document } from "mongoose";
import { IEvent } from "../interfaces/user.interface";

export interface EventDocument extends Omit<Document, "id">, IEvent {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define the budget type for use in the schema
interface Budget {
  allocated: number;
  spent: number;
}

// Define the RSVP type for use in the schema
interface RSVP {
  total: number;
  confirmed: number;
}

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },

    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },
    budget: {
      type: new mongoose.Schema(
        {
          allocated: {
            type: Number,
            required: true,
            min: [0, "Budget must be a positive number"],
          },
          spent: {
            type: Number,
            default: 0,
            min: [0, "Spent budget must be a positive number"],
          },
        },
        { _id: false }
      ),
    },
    guestLimit: {
      type: Number,
      required: true,
      min: [0, "Guest limit must be a positive integer"],
    },
    rsvp: {
      type: new mongoose.Schema(
        {
          total: {
            type: Number,
            default: 0,
          },
          confirmed: {
            type: Number,
            default: 0,
            min: [0, "Confirmed RSVP count must be a positive integer"],
          },
        },
        { _id: false }
      ),
    },

    includedInSplit: {
      type: [
        {
          // userId: { type: Schema.Types.ObjectId, ref: "User" },
          status: {
            type: String,
            default: "pending",
          },
          name: String,
          email: String,
          joinedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    vendorsInSplit: {
      type: [
        {
          vendorId: { type: Schema.Types.ObjectId, ref: "Vendor" },
          title: String,
          price: Number,
          includedAt: { type: Date, default: Date.now },
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
      required: [true, "Event type is required"],
      trim: true,
    },
    durationInDays: {
      type: Number,
      required: [true, "Duration in days is required"],
      min: [1, "Duration must be at least 1 day"],
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

  // Set rsvp.total to match guestLimit if not provided
  if (this.isNew && this.guestLimit && (!this.rsvp || !this.rsvp.total)) {
    if (!this.rsvp) {
      this.rsvp = { total: this.guestLimit, confirmed: 0 };
    } else {
      this.rsvp.total = this.guestLimit;
    }
  }

  next();
});

// Indexes for optimizing queries
eventSchema.index({ creator: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });

const Event = mongoose.model<EventDocument>("Event", eventSchema);
export default Event;
