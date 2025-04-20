"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchById,
  resetEventState,
  selectEventError,
  singleEvent,
} from "@/store/eventSlice";
import EventHeader from "@/app/Components/Events/EventHeader";
import EventTabs from "../../Components/Events/EventTabComponent";
import ErrorMessage from "../Error/ErrorMessage";
import { notFound } from "next/navigation";

const EventDetailClient = ({ id }: { id: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const event = useSelector(singleEvent);
  const eventError = useSelector(selectEventError);
  useEffect(() => {
    dispatch(resetEventState());
    dispatch(fetchById(id));
  }, [dispatch, id]);

  if (eventError) {
    if (eventError.toLocaleLowerCase().includes("not found")) {
      notFound();
    } else {
      return <ErrorMessage message={eventError} />;
    }
  }

  if (!event) return <h1>Loading...</h1>;

  return (
    <div className="p-5 ">
      <EventHeader event={event} />
      <EventTabs id={id} />
    </div>
  );
};

export default EventDetailClient;
