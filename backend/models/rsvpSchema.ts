import mongoose, { Schema, Document } from "mongoose";
import { GuestDocument } from "../Interfaces/rsvp.interface";

export enum GuestStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Declined = "Declined",
}

const GuestSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
      default: "Unknown Guest",
    },
    email: {
      type: String,
      required: [true, "Guest email is required"],
      trim: true,
      lowercase: true,
      default: "nomail@example.com",
    },
    status: {
      type: String,
      enum: Object.values(GuestStatus),
      default: GuestStatus.Pending,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      required: [true, "Event ID is required"],
      ref: "Event",
    },
    joinedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster lookups by email and eventId
GuestSchema.index({ email: 1, eventId: 1 }, { unique: true });

// Pre-save middleware to trim whitespace from strings

GuestSchema.pre<GuestDocument>("save", function (next) {
  if (this.name) this.name = this.name.trim();
  if (this.email) this.email = this.email.toLowerCase().trim();

  // When status changes to Confirmed, set joinedAt
  if (this.isModified("status") && this.status === GuestStatus.Confirmed) {
    this.joinedAt = new Date();
  }

  next();
});

// Virtual for formatting guest display name (for future use)

GuestSchema.virtual("displayName").get(function (this: GuestDocument) {
  return this.name || this.email.split("@")[0];
});

// Method to check if guest has responded

GuestSchema.methods.hasResponded = function (this: GuestDocument): boolean {
  return this.status !== GuestStatus.Pending;
};

// Export the model using both mongoose.model and mongoose.models to handle hot reloading
export default mongoose.models.Guest ||
  mongoose.model<GuestDocument>("Guest", GuestSchema);
