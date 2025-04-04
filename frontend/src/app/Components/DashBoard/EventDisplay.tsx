import React, { useEffect, useState } from "react";
import { Clock, Edit2, Eye, MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  fetchEvents,
  selectEvents,
  selectEventLoading,
  selectEventError,
} from "../../../store/eventSlice";

const EventDisplay: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector(selectEvents);
  const isLoading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        await dispatch(fetchEvents()).unwrap();
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    loadEvents();
  }, [dispatch]);

  const tabs = [
    { id: "all", label: "All" },
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
    { id: "draft", label: "Drafts" },
  ];

  const filteredEvents =
    events?.filter((event) => {
      if (activeTab === "all") return true;
      return event.status === activeTab;
    }) || [];

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const getBudgetStatusColor = (allocated: number, spent: number): string => {
    if (spent > allocated) return "text-red-400";
    if (spent / allocated > 0.8) return "text-yellow-400";
    return "text-green-400";
  };

  // Render event status badge safely
  const renderEventStatusBadge = (status?: string) => {
    if (!status)
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
          Unknown
        </span>
      );

    const statusClasses: Record<string, string> = {
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateValue?: string | Date): string => {
    if (!dateValue) return "No date";
    try {
      return new Date(dateValue).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading || !isInitialized) {
    return (
      <div className="bg-blue-950 text-white rounded-lg shadow-sm p-6 mb-6">
        <div className="border-b border-gray-500 pb-4 mb-4">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-md ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-300 hover:bg-gray-100 hover:text-blue-800"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-white">Loading events...</p>
        </div>
      </div>
    );
  }

  // Handle API errors
  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p>Error fetching events: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-950 text-white rounded-lg shadow-sm p-6 mb-6">
      <div className="border-b border-gray-500 pb-4 mb-4">
        <div className="flex space-x-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-md ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-800"
                  : "text-gray-300 hover:bg-gray-100 hover:text-blue-800"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-300">
            No events available
          </h3>
          <p className="text-gray-300 mt-2 mb-4">Click 'Create New Event'</p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={18} className="mr-2" />
            Create New Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id || `event-${Math.random()}`}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              <img
                src={event.image || "/api/placeholder/400/200"}
                alt={event.name || "Event"}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg text-white">
                    {event.name || "Unnamed Event"}
                  </h3>
                  {renderEventStatusBadge(event.status)}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-gray-300">
                    <Clock size={16} className="mr-2" />
                    <span>
                      {formatDate(event.date)} • {event.time || "No time set"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin size={16} className="mr-2" />
                    <span>{event.location || "No location set"}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="p-2 text-gray-300 hover:bg-gray-950 rounded">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-gray-300 hover:bg-gray-950 rounded">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 text-gray-300 hover:bg-gray-950 rounded">
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
