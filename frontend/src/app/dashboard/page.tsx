"use client";

import Budget from "../Components/DashBoard/Budget";
import SideBar from "../Components/DashBoard/SideBar";
import Testimonials from "../Components/DashBoard/Testimonial";
import EventDisplay from "../Components/DashBoard/EventDisplay";
import Welcome from "../Components/DashBoard/Welcome";
import AuthGuard from "../Components/Home/AuthGuard/AuthGuard";

const Dashboard = () => {

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Welcome />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <EventDisplay />

              <Budget />
            </div>

            <SideBar />
          </div>

          <Testimonials />
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
