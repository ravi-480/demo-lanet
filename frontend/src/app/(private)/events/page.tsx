"use client";
import LoadingSpinner from "@/app/Components/Loader/LoadingSpinner";
import Welcome from "../../Components/DashBoard/Welcome";
import dynamic from "next/dynamic";
import { lazy, Suspense } from "react";

const EventDisplay = dynamic(
  () => import("../../Components/DashBoard/EventDisplay"),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

const EventCalendar = dynamic(
  () => import("../../Components/DashBoard/EventCalendar"),
  { loading: () => <LoadingSpinner />, ssr: false }
);

const Budget = lazy(() => import("../../Components/DashBoard/Budget"));
const Testimonials = lazy(
  () => import("../../Components/DashBoard/Testimonial")
);
const Dashboard = () => {
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-16 py-4 sm:py-7 bg-gray-900">
      <Welcome />

      <div className="w-full mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow">
            <EventDisplay />
          </div>
          <EventCalendar />
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <Budget />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <Testimonials />
      </Suspense>
    </div>
  );
};

export default Dashboard;
