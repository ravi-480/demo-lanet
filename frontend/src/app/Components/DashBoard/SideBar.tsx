import {
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  PieChart,
  Users,
} from "lucide-react";



const SideBar = () => {
  return (
    <div className="space-y-6">
      {/* Calendar Widget */}
      <div className="bg-blue-950 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-300">Calendar</h2>
          <button className="text-gray-300 text-sm">View All</button>
        </div>
        <div className="border border-gray-400 rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-3 text-center">
            <h3 className="font-medium">April 2025</h3>
          </div>
          <div className="grid grid-cols-7 gap-1 p-3 text-sm">
            <div className="text-center text-gray-300">Su</div>
            <div className="text-center text-gray-300">Mo</div>
            <div className="text-center text-gray-300">Tu</div>
            <div className="text-center text-gray-300">We</div>
            <div className="text-center text-gray-300">Th</div>
            <div className="text-center text-gray-300">Fr</div>
            <div className="text-center text-gray-300">Sa</div>

            <div className="text-center py-1 text-gray-300">31</div>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className={`text-center py-1 rounded-full ${
                  day === 1
                    ? "bg-blue-600 text-white"
                    : day === 10
                    ? "bg-blue-100 text-blue-800"
                    : day === 15
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-300 hover:bg-blue-800"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
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

      {/* Quick Links */}
      <div className="bg-blue-950 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-300 mb-4">Quick Links</h2>

        <div className="space-y-2">
          <button className="w-full flex items-center p-3 text-left rounded cursor-pointer hover:bg-blue-900">
            <Calendar size={18} className="text-blue-600 mr-3" />
            <span className="text-gray-300">View Calendar</span>
          </button>

          <button className="w-full flex items-center p-3 text-left rounded cursor-pointer hover:bg-blue-900">
            <PieChart size={18} className="text-blue-600 mr-3" />
            <span className="text-gray-300">Budget Reports</span>
          </button>

          <button className="w-full flex items-center p-3 text-left rounded cursor-pointer hover:bg-blue-900">
            <FileText size={18} className="text-blue-600 mr-3" />
            <span className="text-gray-300">Vendor Contacts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
