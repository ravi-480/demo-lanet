import { Schema } from "mongoose";

export interface VendorData {
  event: Schema.Types.ObjectId | string;
  title: string;
  type?: string;
  address?: string;
  rating?: number;
  description?: string;
  website?: string;
  directionsLink?: string;
  phone?: string;
  price: number;
  finalPrice?: number;
  status?: "pending" | "accepted" | "acceptedOriginal" | "declined";
  placeId: string;
  pricingUnit: string;
  category: string;
  numberOfGuests?: number;
  minGuestLimit?: number;
  addedBy: Schema.Types.ObjectId | string;
  days?: number;
}

export interface VendorSearchParams {
  query: string;
  location: string;
  page?: number;
}

export interface VendorResponse {
  id: Schema.Types.ObjectId | string;
  title: string;
  status: string;
  finalPrice: number;
}

export interface UserSplitData {
  _id?: Schema.Types.ObjectId | string;
  name: string;
  email: string;
  amount?: number;
  status?: string;
  joinedAt?: Date;
  paymentId?: string | null;
  paymentTimestamp?: Date | null;
}

export interface ManualExpenseData {
  title: string;
  price: number;
  status: string;
  eventId: Schema.Types.ObjectId | string;
  pricingUnit: string;
  numberOfGuests?: number;
  minGuestLimit?: number;
  days?: number;
}

export interface ContactVendorData {
  vendorId: Schema.Types.ObjectId | string;
  eventId: Schema.Types.ObjectId | string;
  notes: string;
  isNegotiating: boolean;
  negotiatedPrice?: number;
}

export interface VendorResponseData {
  vendorId: Schema.Types.ObjectId | string;
  eventId: Schema.Types.ObjectId | string;
  userId: Schema.Types.ObjectId | string;
  response: "acceptOriginal" | "acceptNegotiated" | "decline";
  finalPrice?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SplitEmailData {
  recipients: string[];
  amounts: number[];
  eventId: string[];
  userId: string[];
}

export interface VendorSearchResult {
  vendors: any[];
  pagination: {
    currentPage: number;
    perPage: number;
    hasMore: boolean;
  };
}

export interface VendorListResult {
  items: any[];
  pagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserVendorsResult {
  vendors: any[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface BudgetData {
  allocated: number;
  spent: number;
}
