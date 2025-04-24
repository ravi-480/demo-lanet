"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchById,
  resetEventState,
  selectEventError,
  singleEvent,
} from "@/store/eventSlice";
import EventHeader from "@/app/Components/Events/EventHeader";
import EventTabs from "./EventTabComponent";
import ErrorMessage from "../Error/ErrorMessage";
import { notFound } from "next/navigation";

const EventDetailClient = ({ id }: { id: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const event = useSelector(singleEvent);
  const eventError = useSelector(selectEventError);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchById(id));
      setHasFetched(true); // Set to true after fetch
    }

    return () => {
      dispatch(resetEventState()); // Cleanup state on unmount
    };
  }, [dispatch, id, hasFetched]);

  if (eventError?.toLowerCase().includes("not found")) {
    notFound();
  }

  if (eventError) {
    return <ErrorMessage message={eventError} />;
  }

  if (!event) {
    return (
      <div className="text-white text-center py-10">
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <EventHeader event={event} />
      <EventTabs id={id} />
    </div>
  );
};

export default EventDetailClient;
