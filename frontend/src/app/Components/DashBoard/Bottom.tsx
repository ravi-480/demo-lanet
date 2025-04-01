import { Clock, Search } from "lucide-react";
import React from "react";

const vendorCategories = [
  "Catering",
  "Venues",
  "Photography",
  "Decor",
  "Music",
  "Videography",
  "Transportation",
  "Printing",
];

const Bottom = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Upcoming Deadlines
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-start">
              <div className="bg-red-100 p-2 rounded">
                <Clock size={16} className="text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  Finalize menu selections
                </p>
                <p className="text-xs text-gray-500">
                  Company Annual Meeting • 3 days left
                </p>
              </div>
            </div>
            <button className="text-blue-600 text-sm hover:underline">
              Mark Complete
            </button>
          </div>

          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-start">
              <div className="bg-yellow-100 p-2 rounded">
                <Clock size={16} className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  Order wedding invitations
                </p>
                <p className="text-xs text-gray-500">
                  Smith Wedding • 5 days left
                </p>
              </div>
            </div>
            <button className="text-blue-600 text-sm hover:underline">
              Mark Complete
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded">
                <Clock size={16} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  Book marketing photographer
                </p>
                <p className="text-xs text-gray-500">
                  Product Launch • 10 days left
                </p>
              </div>
            </div>
            <button className="text-blue-600 text-sm hover:underline">
              Mark Complete
            </button>
          </div>
        </div>
      </div>

      {/* Vendor Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Find Vendors</h2>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for vendors..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {vendorCategories.slice(0, 8).map((category, index) => (
            <button
              key={index}
              className="p-2 bg-gray-100 rounded text-sm text-gray-800 hover:bg-gray-200"
            >
              {category}
            </button>
          ))}
        </div>

        <button className="w-full mt-2 bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded text-sm font-medium">
          View All Vendor Categories
        </button>
      </div>
    </div>
  );
};

export default Bottom;
