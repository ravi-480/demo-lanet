import React, { useEffect, useState } from "react";
import { Clock, MapPin, Users, IndianRupee } from "lucide-react";
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
import Image from "next/image";
import RenderEventStatusBadge from "./EventStatus";
import { tabs } from "@/StaticData/Static";
import { getEventStatus } from "@/utils/helper";

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

  const now = new Date().getTime();

  const filteredEvents =
    events?.filter((event: { date: string | number | Date; status: string; }) => {
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

  const getBudgetStatusColor = (allocated: number, spent: number): string => {
    if (spent > allocated) return "text-red-400";
    if (spent / allocated > 0.8) return "text-yellow-400";
    return "text-green-400";
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
                className={`px-3  py-2 rounded-md ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-300 hover:bg-gray-100  hover:text-blue-800"
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              <Image
                src={event.image || "/api/placeholder/400/200"}
                alt={event.name || "Event"}
                className="w-full h-40 object-cover"
                width={100}
                height={100}
              />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg text-white">
                    {event.name || "Unnamed Event"}
                  </h3>
                  {RenderEventStatusBadge(getEventStatus(event.date))}
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
                    <IndianRupee size={16} className="mr-2" />
                    <span>
                      Budget: ₹{event.budget?.allocated || 0}
                      {event.budget?.spent !== undefined && (
                        <span
                          className={getBudgetStatusColor(
                            event.budget?.allocated || 0,
                            event.budget?.spent || 0
                          )}
                        >
                          ({event.budget?.spent || 0} spent)
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
