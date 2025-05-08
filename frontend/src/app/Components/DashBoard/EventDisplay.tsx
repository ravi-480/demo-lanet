"use client";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchEvents } from "../../../store/eventSlice";
import Link from "next/link";
import { useEventFilter } from "../../../hooks/useEventFilter";
import EventTabs from "../Events/EventTab";
import LoadingState from "../Loading/Loading";
import EventCard from "../Events/EventCard";

const EventDisplay = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, isLoading, error } = useSelector(
    (state: RootState) => state.event
  );
  const initialFetchDone = useRef(false);
  const { activeTab, setActiveTab, filteredEvents } = useEventFilter({
    events,
  });

  useEffect(() => {
    if (initialFetchDone.current) return;

    const fetchData = async () => {
      try {
        await dispatch(fetchEvents()).unwrap();
        initialFetchDone.current = true;
      } catch (error: unknown) {
        const err = error as {
          message?: string;
          response?: { status?: number };
        };
        const errMsg = err?.message || err;

        // Don't retry on auth errors
        if (
          errMsg === "Unauthorized" ||
          errMsg === "AUTH_ERROR" ||
          err?.response?.status === 401
        ) {
          initialFetchDone.current = true;
          return;
        }

        throw error;
      }
    };

    fetchData();
  }, [dispatch]);

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

  const displayEvents = filteredEvents.slice(0, 3);

  return (
    <div className="bg-gray-900 border text-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-6 w-full">
      <div className="border-b border-gray-500 flex justify-between pb-4 mb-4">
        <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {filteredEvents.length > 3 && (
          <Link
            href="/events/all"
            className="mt-2 cursor-pointer hover:text-indigo-700"
          >
            View All
          </Link>
        )}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-300">
            No events available
          </h3>
          <p className="text-gray-300 mt-2 mb-4">
            Click &apos;Create New Event&apos;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {displayEvents.map((event,index:number) => (
            <EventCard key={index} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventDisplay;
