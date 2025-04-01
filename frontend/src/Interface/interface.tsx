import { SliderImage } from "@/Types/type";

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
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
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



export interface EventDisplayProps {
  events: CustomEvent[];
  activeTab: "all" | "upcoming" | "past" | "drafts";
  setActiveTab: (tab: "all" | "upcoming" | "past" | "drafts") => void;
  formatCurrency: (amount: number) => string;
  getBudgetStatusColor: (allocated: number, spent: number) => string;
}