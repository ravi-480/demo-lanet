import React from "react";
import { Clock, Edit2, Eye, MapPin, Plus, Trash2 } from "lucide-react";
import { EventDisplayProps } from "../../../Interface/interface"; // Adjust path as needed

const EventDisplay: React.FC<EventDisplayProps> = ({
  events,
  activeTab,
  setActiveTab,
  formatCurrency,
  getBudgetStatusColor,
}) => {
  const filteredEvents = events.filter((event) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return event.status === "upcoming";
    if (activeTab === "past") return event.status === "completed";
    if (activeTab === "drafts") return event.status === "draft";
    return true;
  });

  return (
    <div className="bg-blue-950 text-white  rounded-lg shadow-sm p-6 mb-6">
      <div className="border-b border-gray-500 pb-4 mb-4">
        <div className="flex space-x-4">
          {["all", "upcoming", "past", "drafts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-2 rounded-md ${
                activeTab === tab
                  ? "bg-blue-100 text-blue-800"
                  : "text-gray-300 hover:bg-gray-100 cursor-pointer hover:text-blue-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-800">
            No events available
          </h3>
          <p className="text-gray-600 mt-2 mb-4">Click 'Create New Event'</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition">
            <Plus size={18} className="mr-2" />
            Create New Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              <img
                src={event.image || "/api/placeholder/400/200"}
                alt={event.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg text-white">
                    {event.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === "upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : event.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {event.status.replace("-", " ")}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-gray-300">
                    <Clock size={16} className="mr-2" />
                    <span>
                      {new Date(event.date).toLocaleDateString()} • {event.time}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin size={16} className="mr-2" />
                    <span>{event.location}</span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Budget</span>
                      <span
                        className={getBudgetStatusColor(
                          event.budget.allocated,
                          event.budget.spent
                        )}
                      >
                        {formatCurrency(event.budget.spent)}/
                        {formatCurrency(event.budget.allocated)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          event.budget.spent > event.budget.allocated
                            ? "bg-red-500"
                            : event.budget.spent / event.budget.allocated > 0.8
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (event.budget.spent / event.budget.allocated) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">RSVPs</span>
                      <span className="text-gray-800">
                        {event.rsvp.confirmed}/{event.rsvp.total} confirmed
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (event.rsvp.confirmed / event.rsvp.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="p-2 text-gray-300 hover:bg-gray-950 cursor-pointer rounded">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-gray-300 hover:bg-gray-950 cursor-pointer rounded">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 text-gray-300 hover:bg-gray-950 cursor-pointer rounded">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventDisplay;
