"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
  fetchEvents,
  selectEvents,
  selectEventLoading,
  selectEventError,
  selectPagination,
} from "../../../store/eventSlice";
import Link from "next/link";
import { useEventFilter } from "../../../hooks/useEventFilter";
import EventTabs from "../Events/EventTab";
import LoadingState from "../Loading/Loading";
import EventCard from "../Events/EventCard";


const EventDisplay = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector(selectEvents);
  const isLoading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
  const pagination = useSelector(selectPagination);

  const {
    activeTab,
    setActiveTab,
    searchTerm,
    dateFilter,
    locationFilter,
  } = useEventFilter({ initialTab: "all" });

  // Initial fetch is handled by the hook now

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white rounded-lg shadow-sm p-6 mb-6 w-full">
        <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <LoadingState />
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

  const displayEvents = events.slice(0, 3);

  return (
    <div className="bg-gray-900 border text-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-6 w-full">
      <div className="border-b border-gray-500 pb-4 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <Link
            href="/events/all"
            className="mt-2 cursor-pointer hover:text-indigo-500 transition"
          >
            View All
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-300">
            No events available
          </h3>
          <p className="text-gray-300 mt-2 mb-4">
            {searchTerm || dateFilter || locationFilter
              ? "Try adjusting your filters"
              : "Click 'Create New Event'"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {displayEvents.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>

          {/* Show pagination indicator on the dashboard view */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <p className="text-sm text-gray-400">
                Showing {displayEvents.length} of {pagination.totalEvents}{" "}
                events.
                <Link
                  href="/events/all"
                  className="ml-2 text-indigo-400 hover:text-indigo-300"
                >
                  View all with pagination
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
