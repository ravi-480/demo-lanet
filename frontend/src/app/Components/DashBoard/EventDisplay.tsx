"use client";

import { useSelector } from "react-redux";
import {
  selectEvents,
  selectEventLoading,
  selectEventError,
  selectPagination,
} from "../../../store/eventSlice";
import Link from "next/link";
import { useEventFilter } from "../../../hooks/useEventFilter";
import EventTabs from "../Events/EventTab";
import EventCard from "../Events/EventCard";

const EventDisplay = () => {
  const events = useSelector(selectEvents);
  const isLoading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
  const pagination = useSelector(selectPagination);

  // Pass skipInitialFetch: true if events are already loaded
  const { activeTab, setActiveTab } = useEventFilter({
    initialTab: "all",
    skipInitialFetch: events.length > 0,
  });

  // Simple loading state without animations
  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-400 rounded-lg p-4 sm:p-6 mb-6 w-full">
        <div className="border-b border-gray-700 pb-4 mb-4">
          <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-gray-400 rounded-lg p-4 sm:p-6 mb-6 w-full">
        <div className="text-center py-6 text-red-400">
          <p>Unable to load events. Please try again.</p>
        </div>
      </div>
    );
  }

  const displayEvents = events.slice(0, 3);

  return (
    <div className="bg-gray-900 border text-gray-200 border-gray-400 md:p-5 rounded-lg p-4 sm:p-6 mb-6 w-full">
      <div className="border-b border-gray-700 pb-4 mb-4">
        <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-300">
            No events available
          </h3>
          <p className="text-gray-300 mt-2">
            Click 'Create New Event' to add events
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayEvents.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>

          {pagination.totalPages && events.length > 3 && (
            <div className="flex justify-center mt-3">
              <p className="text-sm text-gray-400">
                Showing {displayEvents.length} of {pagination.totalEvents}{" "}
                events.
                <Link
                  href="/events/all"
                  className="ml-2 text-indigo-400 hover:text-indigo-300"
                >
                  View all
                </Link>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventDisplay;
