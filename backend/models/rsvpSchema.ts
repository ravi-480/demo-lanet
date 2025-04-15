import mongoose, { Schema, Document } from "mongoose";

export enum GuestStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Declined = "Declined",
}

export interface IGuest extends Document {
  name: string;
  email: string;
  eventId: string;
  status: GuestStatus;
}

const GuestSchema: Schema = new Schema(
  {
    name: {
      type: String,
      default: "unknown",
    },
    email: {
      type: String,
      default: "nomail@gmail.com",
    },
    status: {
      type: String,
      enum: Object.values(GuestStatus),
      default: "Pending",
    },
    eventId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Event",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Guest ||
  mongoose.model<IGuest>("Guest", GuestSchema);
