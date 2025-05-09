import { Document, Types } from "mongoose";

// Base Guest interface
export interface IGuest {
  name: string;
  email: string;
  status: "Pending" | "Confirmed" | "Declined";
  eventId: string;
  joinedAt?: Date;
  _id?: string;
}

// Guest document interface extends both Document and IGuest
export interface GuestDocument extends Document, IGuest {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vendor information for price updates
export interface VendorInfo {
  id: string;
  title: string;
  priceChange?: number;
  newPrice?: number;
  minGuestLimit?: number;
  adjustedPrice?: number;
}

// Guest limit check result
export interface GuestLimitCheckResult {
  exceedsLimit: boolean;
  currentCount: number;
  limit: number;
  potentialTotal: number;
  additionalAllowed?: number;
}

// Vendor price update result
export interface VendorPriceUpdateResult {
  totalCostChange: number;
  updatedVendors: VendorInfo[];
  violatingVendors: VendorInfo[];
}

// Add Single Guest Input
export interface AddSingleGuestInput {
  name: string;
  email: string;
  eventId: string;
  status?: "Pending" | "Confirmed" | "Declined";
}

// Add Single Guest Response
export interface AddSingleGuestResponse {
  guest: GuestDocument;
  vendorsUpdated: boolean;
  updatedVendors?: VendorInfo[];
  budgetUpdated: boolean;
  additionalCost: number;
}

// Remove Guest Response
export interface RemoveGuestResponse {
  violatingVendors?: VendorInfo[];
  budgetUpdated: boolean;
  budgetReduction: number;
}

// Process Guests From File Response
export interface ProcessGuestsFromFileResponse {
  newGuestsAdded: number;
  duplicatesSkipped: number;
  totalGuests: number;
  vendorsUpdated: boolean;
  additionalCost: number;
}

// Remove All By Type Response
export interface RemoveAllByTypeResponse {
  preservedVendors?: VendorInfo[];
  budgetUpdated: boolean;
  budgetReduction: number;
}

// Guest details for validation response
export interface GuestValidationResponse {
  guest: {
    name: string;
    email: string;
    date: Date;
    location: string;
    responseStatus: string;
  };
}

// Submit Guest Response Result
export interface SubmitGuestResponseResult {
  status: string;
}

// Update Guest Info Input
export interface UpdateGuestInfoInput {
  name: string;
  email: string;
  status: string;
}

// Guest with Event data for emails
export interface GuestWithEventData {
  _id: string;
  name: string;
  email: string;
  eventId?: string;
}

// Query Parameters for getUserByEventId
export interface GetUserByEventIdQuery {
  onlyStats?: string;
  search?: string;
  status?: string;
  page?: string;
  limit?: string;
}

// Stats response for getUserByEventId
export interface GuestStatsResponse {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

// Full response for getUserByEventId
export interface GetUserByEventIdResponse extends GuestStatsResponse {
  success: boolean;
  message: string;
  rsvpList: GuestDocument[];
  pagination: {
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}
