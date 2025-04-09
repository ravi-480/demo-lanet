"use client";

import React, { useState } from "react";
import Budget from "../Components/DashBoard/Budget";
import SideBar from "../Components/DashBoard/SideBar";
import Testimonials from "../Components/DashBoard/Testimonial";
import Bottom from "../Components/DashBoard/Bottom";
import EventDisplay from "../Components/DashBoard/EventDisplay";
import Welcome from "../Components/DashBoard/Welcome";
import AuthGuard from "../Components/Home/AuthGuard/AuthGuard";

// Types
type EventStatus = "upcoming" | "in-progress" | "completed" | "draft";
type EventCategory =
  | "wedding"
  | "corporate"
  | "birthday"
  | "conference"
  | "other";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  budget: {
    allocated: number;
    spent: number;
  };
  rsvp: {
    confirmed: number;
    total: number;
  };
  status: EventStatus;
  category: EventCategory;
  image?: string;
}

// Sample data
const sampleEvents: Event[] = [
  {
    id: "1",
    name: "Company Annual Meeting",
    date: "2025-05-15",
    time: "10:00 AM",
    location: "Grand Convention Center",
    budget: {
      allocated: 5000,
      spent: 2400,
    },
    rsvp: {
      confirmed: 15,
      total: 20,
    },
    status: "upcoming",
    category: "corporate",
    image: "/api/placeholder/400/200",
  },
  {
    id: "2",
    name: "Smith Wedding",
    date: "2025-06-20",
    time: "4:00 PM",
    location: "Seaside Resort",
    budget: {
      allocated: 15000,
      spent: 9800,
    },
    rsvp: {
      confirmed: 78,
      total: 100,
    },
    status: "upcoming",
    category: "wedding",
    image: "/api/placeholder/400/200",
  },
  {
    id: "3",
    name: "Product Launch",
    date: "2025-04-10",
    time: "2:00 PM",
    location: "Tech Hub",
    budget: {
      allocated: 8000,
      spent: 7900,
    },
    rsvp: {
      confirmed: 45,
      total: 50,
    },
    status: "draft",
    category: "corporate",
    image: "/api/placeholder/400/200",
  },
  {
    id: "4",
    name: "Quarterly Team Retreat",
    date: "2025-03-15",
    time: "9:00 AM",
    location: "Mountain Lodge",
    budget: {
      allocated: 3000,
      spent: 3200,
    },
    rsvp: {
      confirmed: 18,
      total: 18,
    },
    status: "completed",
    category: "corporate",
    image: "/api/placeholder/400/200",
  },
];

const sampleExpenses = [
  {
    id: "e1",
    eventId: "1",
    date: "2025-04-01",
    vendor: "ABC Catering",
    amount: 1200,
    category: "Food & Drinks",
  },
  {
    id: "e2",
    eventId: "1",
    date: "2025-04-05",
    vendor: "Sound Systems Inc",
    amount: 800,
    category: "Equipment",
  },
  {
    id: "e3",
    eventId: "2",
    date: "2025-04-10",
    vendor: "Floral Designs",
    amount: 1500,
    category: "Decoration",
  },
  {
    id: "e4",
    eventId: "2",
    date: "2025-04-12",
    vendor: "Wedding Photographer",
    amount: 2500,
    category: "Services",
  },
  {
    id: "e5",
    eventId: "3",
    date: "2025-04-15",
    vendor: "Promo Materials",
    amount: 1200,
    category: "Marketing",
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<
    "all" | "upcoming" | "past" | "drafts"
  >("all");

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <Welcome />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Events Display */}
              <EventDisplay />

              {/* Budget Summary Section */}
              <Budget />
            </div>

            {/* Sidebar */}
            <SideBar />
          </div>

          {/* Testimonials Section */}
          {/* <Testimonials /> */}

          {/* Bottom Section */}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
