import mongoose, { Schema, InferSchemaType } from "mongoose";

const vendorSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    title: { type: String, required: true },
    type: { type: String, default: "manual" },
    address: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    description: { type: String },
    website: { type: String },
    directionsLink: { type: String },
    phone: { type: String },
    price: { type: Number, required: true },
    finalPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "accepted", "acceptedOriginal", "declined"],
      default: "pending",
    },
    placeId: { type: String, required: true },
    pricingUnit: { type: String, required: true },
    category: { type: String, required: true },
    numberOfGuests: { type: Number, default: 0 },
    minGuestLimit: { type: Number }, // Added this field for minimum guest requirement
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    days: { type: Number }, // Added days field for per day pricing
  },
  { timestamps: true }
);

// Infer TypeScript type from the schema automatically
export type VendorDocument = InferSchemaType<typeof vendorSchema>;

// Export the model
const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
