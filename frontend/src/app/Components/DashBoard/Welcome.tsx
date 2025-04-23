"use client";
import { Button } from "@/components/ui/button";
import { selectEvents } from "@/store/eventSlice";
import { RootState } from "@/store/store";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import { getNoOfUpcomingEvent } from "../../../utils/helper";

const Welcome = () => {
  const events = useSelector(selectEvents) || [];
  const val = getNoOfUpcomingEvent(events);
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="bg-gray-900 border border-gray-400 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center text-center md:text-left">
        <div>
          <h1
            className="text-2xl font-semibold text-gray-100"
            style={{ fontSize: "1.5rem", lineHeight: "2rem" }}
          >
            Welcome back,<span className="capitalize"> {user?.name}</span>
          </h1>

          <p className="text-cyan-300 mt-1">
            You have <span className="font-semibold">{val}</span> upcoming
            events
          </p>
        </div>

        <Link href="/create-events">
          <Button className="mt-4 md:mt-0 flex py-5">
            <Plus size={18} className="mr-2" />
            Create New Event
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
