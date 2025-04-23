
import Budget from "../../Components/DashBoard/Budget";
import Testimonials from "../../Components/DashBoard/Testimonial";
import EventDisplay from "../../Components/DashBoard/EventDisplay";
import Welcome from "../../Components/DashBoard/Welcome";
import EventCalendar from "@/app/Components/DashBoard/EventCalendar";
import dynamic from 'next/dynamic';

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
      
      <Budget />
      
      <Testimonials />
    </div>
  );
};

export default Dashboard;