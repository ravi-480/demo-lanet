import { CheckCircle, DollarSign, Users } from "lucide-react";
import EventCalendar from "./EventCalendar";

const SideBar = () => {
  return (
    <div className="space-y-4 ">
      <div className="bg-gray-900 flex flex-col justify-center items-center rounded-lg shadow-sm p-6">
        <div className="flex items-center  flex-row justify-center w-full mb-2">
          <h2 className="text-lg font-medium  text-gray-300">Calendar</h2>
        </div>
          <EventCalendar />
      </div>

      {/* Recent Activity */}
      <div className="bg-blue-950 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-300">Recent Activity</h2>
          <button className="text-gray-300 text-sm">View All</button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded">
              <Users size={16} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-300">
                New RSVP from <span className="font-medium">John Smith</span>
              </p>
              <p className="text-xs text-gray-400">
                Company Annual Meeting • 2 hours ago
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded">
              <DollarSign size={16} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-300">New expense added</p>
              <p className="text-xs text-gray-400">
                Smith Wedding • 5 hours ago
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded">
              <CheckCircle size={16} className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-300">Vendor confirmed</p>
              <p className="text-xs text-gray-400">
                Product Launch • Yesterday
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
