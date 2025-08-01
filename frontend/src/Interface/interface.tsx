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
  [x: string]: unknown;
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
  status?: string;
  type: string;
  address: string;
  email?: string;
  rating: number;
  description?: string;
  website?: string;
  directionsLink?: string;
  placeId: string;
  phone?: string;
  finalPrice?: number;
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
  status: "pending" | "Paid";
  joinedAt?: Date | undefined;
}

export interface Vendor {
  title: string;
  price: number;
}

export interface Props {
  eventId: string;
  users: SplitUser[];
  onClose: () => void;
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
  metadata: Record<string, string>;
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
  noOfGuest: number;
  addedBy?: string;
  eventLocation: string;
  noOfAddedGuest: number;
  eventId?: string;
}

export interface GuestStatus {
  status: "Confirmed" | "Pending" | "Declined" | string;
}

export interface IGuest extends GuestStatus {
  name: string;
  email: string;
  eventId: string;
}

export interface AuthResponseData {
  user?: {
    id: string;
    name: string;
    email: string;
    [key: string]: unknown;
  };
  accessToken?: string;
  message?: string;
  data?: AuthResponseData;
  [key: string]: unknown;
}

export interface ProcessedEvent {
  id: string;
  date: Date;
  name: string;
  location: string;
}

export interface Event {
  _id: string;
  name: string;
  date: string | Date;
  location?: string;
  description?: string;
}
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  limit: number;
}

export interface PaginatedResponse {
  events: IEvent[];
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  limit: number;
  success?: boolean;
}

export interface EventState {
  events: IEvent[];
  isLoading: boolean;
  singleEvent: IEvent | null;
  error: string | null;
  pagination: PaginationState;
}

export interface EventCardProps {
  event: {
    _id: string;
    image?: string;
    name?: string;
    date: string | Date;
    location?: string;
    status?: string;
    budget?: { allocated: number };
    description?: string;
  };
  variant?: "compact" | "detailed";
}

export interface ProcessedEvent {
  date: Date;
  name: string;
  location: string;
}

export interface GuestStat {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}
export interface MyPieChartProps {
  event: IEvent;
  guestStats: GuestStat | null;
}

export interface PayloadItem {
  payload: {
    name: string;
    value: number;
  };
}

export interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
}

type StatusType = "idle" | "loading" | "succeeded" | "failed";

// Adding pagination interface
export interface PaginationMeta {
  hasPrevPage: PaginationMeta | null;
  hasNextPage: PaginationMeta | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface VendorState {
  items: VendorType[];
  pagination: PaginationMeta | null;
  status: StatusType;
  error: string | { message: string } | null;
}

export interface ManualVendorExpenseData {
  eventId: string;
  title: string;
  price: number;
  description?: string;
  [key: string]: string | number | undefined;
}

// Updated mail request interface to handle both mail and negotiation
export interface SendMailRequest {
  vendorId: string;
  eventId: string;
  notes: string;
  isNegotiating?: boolean;
  negotiatedPrice?: number;
}

export interface FormData {
  name: string;
  email: string;
  status: string;
}

export interface GuestDialogProps {
  eventId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editGuest: Guest | null;
  onSuccess: () => void;
  setEditGuest: React.Dispatch<React.SetStateAction<Guest | null>>;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  forgotPasswordSuccess: boolean;
  forgotPasswordMessage: string | null;
  resetPasswordSuccess: boolean;
  resetPasswordMessage: string | null;
}
