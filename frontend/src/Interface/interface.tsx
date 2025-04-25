import { EventType } from "react-hook-form";

export interface IEvent {
  _id: string;
  name: string;
  date: string | Date;
  time: string;
  location: string;
  description: string;
  image: string;
  status: string;
  budget: {
    allocated: number;
    spent: number;
  };
  guestLimit: number;
  noOfGuestAdded: number;
  includedInSplit: {
    userId: string;
    name: string;
    email: string;
    joinedAt?: Date;
  };

  creator: string;
  eventType: EventType;
  durationInDays: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface EventDisplayProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formatCurrency: (amount: number) => string;
  getBudgetStatusColor: (allocated: number, spent: number) => string;
}

export interface IBudget {
  allocated: number;
  spent: number;
}

export interface IRSVP {
  confirmed: number;
  total: number;
}

export interface SliderImage {
  id: string;
  src: string;
  alt: string;
}

export interface ImageSliderProps {
  images: SliderImage[];
  autoplay?: boolean;
  autoplaySpeed?: number;
}

export interface FeatureBlockProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  reverse?: boolean;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
}

export interface FeatureCardProps {
  imageSrc: string;
  title: string;
  description: string;
  reverse?: boolean;
}

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
}

// Response types
export interface LoginResponse {
  user: User;
  token: string;
}

// signup payload type

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface StandardResponse {
  [x: string]: any;
  success: boolean;
  message: string;
}

export interface CustomEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  status: "upcoming" | "in-progress" | "completed" | "draft";
  budget: {
    allocated: number;
    spent: number;
  };
  rsvp: {
    confirmed: number;
    total: number;
  };
}

// Update your VendorType interface to include all necessary properties:
export interface VendorType {
  _id: string;
  event: string;
  title: string;
  type: string;
  address: string;
  email?: string;
  rating: number;
  description?: string;
  website?: string;
  directionsLink?: string;
  placeId: string;
  phone?: string;
  price: number;
  pricingUnit: string;
  category: string;
  createdAt?: string;
  numberOfGuests: number;
  addedBy: string;
  minGuestLimit?: number;
  days?: number;
  isIncludedInSplit?: boolean;
}

export interface Expense {
  id: string;
  eventId: string;
  date: string;
  vendor: string;
  amount: number;
  category: string;
}

export interface Event {
  id: string;
  name: string;
}

export interface BudgetProps {
  expenses: Expense[];
  events: Event[];
  formatCurrency: (amount: number) => string;
}

export interface Testimonials1 {
  id: string;
  name: string;
  image: string;
  rating: number;
  quote: string;
  eventType: string;
}

export interface BaseVendor {
  event: string;
  title: string;
  type: string;
  address: string;
  rating: number;
  reviews: number;
  description?: string;
  website?: string;
  directionsLink?: string;
  placeId: string;
  yearsInBusiness?: string;
  phone?: string;
  price: number;

  pricingUnit: string;
  category: string;
  numberOfGuests: number;
  addedBy: string;
}

// split vendor interface

export interface SplitVendor {
  vendorId: string;
  title: string;
  category: string;
  price: number;
  pricingUnit: string;
}

export interface SplitState {
  eventId: string | null;
  splitVendors: SplitVendor[];
}

export interface SplitUser {
  name: string;
  _id: string;
  email: string;
  status: "pending" | "confirmed";
}

export interface SplitUser {
  userId: string;
  name: string;
  status: "pending" | "confirmed";
  email: string;
  joinedAt?: Date | undefined;
}

export interface Vendor {
  title: string;
  price: number;
}

export interface Props {
  eventId: string;
  users: SplitUser[];
}

export interface Guest {
  _id: string;
  name: string;
  email: string;
  status: "Confirmed" | "Pending" | "Declined";
  eventId: string;
}

export enum EventTypeEnum {
  Wedding = "Wedding",
  Birthday = "Birthday",
  Corporate = "Corporate",
  Anniversary = "Anniversary",
  BabyShower = "Baby Shower",
  Engagement = "Engagement",
  Graduation = "Graduation",
  Festival = "Festival",
  Concert = "Concert",
  CharityGala = "Charity Gala",
  Farewell = "Farewell Party",
  Housewarming = "Housewarming",
  Workshop = "Workshop",
}

export const eventTypeOptions = Object.entries(EventTypeEnum).map(
  ([key, value]) => ({
    label: value,
    value: key.toLowerCase(),
  })
);

export interface INotification {
  _id: string;
  userId: string;
  eventId: string;
  message: string;
  type: "response" | "payment" | "reminder" | "message";
  status: "read" | "unread";
  metadata: Record<string, any>;
  createdAt: Date;
}

export type PricingUnit =
  | "per plate"
  | "per hour"
  | "per day"
  | "flat rate"
  | "per setup";

export interface VendorBase {
  title: string;
  address: string;
  description?: string;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  type?: string;
  hours?: string;
  links?: {
    website?: string;
    directions?: string;
  };
  phone?: string;
  place_id?: string;
  placeId?: string;
}

export interface VendorWithPricing extends VendorBase {
  price: number;
  category: string;
  pricingUnit: PricingUnit;
  minGuestLimit?: number;
}

export interface VendorCardProps {
  vendor: VendorWithPricing;
  category: string;
  pricingUnit?: PricingUnit;
  numberOfGuests?: number;
  eventId?: string;
  noOfAddedGuest: number;
  addedBy?: string;
  noOfDay?: number;
  minGuestLimit?: number;
}

export interface SearchVendorProps {
  eventType: string;
  noOfDay: number;
  allowedCategories: string[];
  noOfGuest: number;
  addedBy?: string;
  eventLocation: string;
  noOfAddedGuest: number;
  eventId?: string;
}
