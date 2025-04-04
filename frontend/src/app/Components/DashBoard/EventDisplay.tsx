import React, { useEffect, useState } from "react";
import {
  Clock,
  Edit2,
  Eye,
  MapPin,
  Plus,
  Trash2,
  DollarSign,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  fetchEvents,
  selectEvents,
  selectEventLoading,
  selectEventError,
} from "../../../store/eventSlice";
import Link from "next/link";

const EventDisplay: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector(selectEvents) || [];
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

  const now = new Date().getTime();

  const filteredEvents =
    events?.filter((event) => {
      if (activeTab === "all") return true;
      if (activeTab === "upcoming") {
        const eventDate = new Date(event.date).getTime();
        return eventDate > now;
      }
      if (activeTab === "past") {
        const eventDate = new Date(event.date).getTime();
        return eventDate <= now;
      }
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

  const getEventStatus = (date?: string | Date): string => {
    if (!date) return "unknown";
    try {
      const eventDate = new Date(date).getTime();
      return eventDate > now ? "upcoming" : "past";
    } catch {
      return "unknown";
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
                  {renderEventStatusBadge(getEventStatus(event.date))}
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

                  <div className="flex items-center text-gray-300">
                    <DollarSign size={16} className="mr-2" />
                    <span>
                      Budget: {formatCurrency(event.budget?.allocated || 0)}
                      {event.budget?.spent !== undefined && (
                        <span
                          className={getBudgetStatusColor(
                            event.budget?.allocated || 0,
                            event.budget?.spent || 0
                          )}
                        >
                          ({formatCurrency(event.budget?.spent || 0)} spent)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <Users size={16} className="mr-2" />
                    <span>
                      RSVPs: {event.rsvp?.confirmed || 0} confirmed
                      {event.rsvp?.total !== undefined &&
                        ` / ${event.rsvp.total} invited`}
                    </span>
                  </div>
                </div>
                <Link href={`/events/${event._id}`}>
                  <Button className="mt-3 cursor-pointer">View more</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventDisplay;
