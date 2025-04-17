import mongoose, { Schema, InferSchemaType } from "mongoose";

const vendorSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    title: { type: String, required: true },
    type: { type: String, required: true },
    address: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    description: { type: String },
    website: { type: String },
    directionsLink: { type: String },
    placeId: { type: String, required: true, unique: true },
    yearsInBusiness: { type: String },
    phone: { type: String },
    price: { type: Number, required: true },
    pricingUnit: { type: String, required: true },
    category: { type: String, required: true },
    numberOfGuests: { type: Number, default: 1 },
    isIncludedInSplit: { type: Boolean, default: false },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Infer TypeScript type from the schema automatically
export type VendorDocument = InferSchemaType<typeof vendorSchema>;

// Export the model
const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;