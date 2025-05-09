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
import ErrorMessage from "../Error/ErrorMessage";
import { notFound } from "next/navigation";
import EventTabComponent from "./EventTabComponent";
import { AnimatePresence, motion } from "framer-motion";

const EventDetailClient = ({ id }: { id: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const event = useSelector(singleEvent);
  const eventError = useSelector(selectEventError);
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchById(id))
        .then(() => {
          setTimeout(() => setIsLoading(false), 300);
        })
        .catch(() => {
          setIsLoading(false);
        });
      setHasFetched(true);
    }

    return () => {
      dispatch(resetEventState()); // Cleanup state on unmount
    };
  }, [dispatch, id, hasFetched]);

  if (eventError?.toLowerCase().includes("not found")) {
    notFound();
  }

  if (eventError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ErrorMessage message={eventError} />
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen w-full flex flex-col items-center justify-center text-white"
        >
          <div className="w-16 h-16 relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-700 border-t-cyan-500 animate-spin"></div>
          </div>
          <p className="mt-4 text-lg font-medium animate-pulse">
            Loading event details...
          </p>
        </motion.div>
      ) : event ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="p-5"
        >
          <EventHeader event={event} />
          <EventTabComponent />
        </motion.div>
      ) : (
        <motion.div
          key="no-event"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen w-full flex flex-col items-center justify-center text-white"
        >
          <p className="text-lg font-medium">No event details available.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventDetailClient;
