"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchById, singleEvent } from "@/store/eventSlice";
import EventHeader from "@/app/Components/Events/EventHeader";
import EventTabs from "../../Components/Events/EventTabComponent";

const EventDetailClient = ({ id }: { id: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const event = useSelector(singleEvent);

  useEffect(() => {
    dispatch(fetchById(id));
  }, [dispatch, id]);

  if (!event) return <h1>Loading...</h1>;

  return (
    <div className="p-5">
      <EventHeader event={event} />
      <EventTabs />
    </div>
  );
};

export default EventDetailClient;
