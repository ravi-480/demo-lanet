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
    <div className="bg-gray-900 border rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center text-center md:text-left">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-amber-100 mt-1">You have {val} upcoming events</p>
        </div>

        <Link href="/create-events">
          <Button
            className="mt-4 md:mt-0 flex items-center justify-center bg-amber-100 text-gray-900 cursor-pointer
            hover:bg-amber-200 px-4 py-6 rounded-md transition"
          >
            <Plus size={18} className="mr-2" />
            Create New Event
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
