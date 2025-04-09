import { SliderImage } from "@/Types/type";
import { EventType } from "react-hook-form";

export interface IEvent {
  _id: string;
  name: string;
  date: string | Date;
  time: string;
  location: string;
  description: string;
  image: string;
  budget: {
    allocated: number;
    spent: number;
  };
  guestLimit: number;
  rsvp: {
    confirmed: number;
    total: number;
  };
  includedInSplit: {
    userId: string;
    name: string;
    email: string;
    joinedAt?: Date;
  };
  vendorsInSplit: {
    vendorId: string;
    title: string;
    price: string;
    includedAt?: Date;
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

export interface VendorType {
  _id?: string;
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
  createdAt?: string;
  updatedAt?: string;
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
  users: SplitUser[];
  vendors: Vendor[];
}