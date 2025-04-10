import React, { useState } from "react";
import { IEvent } from "../../../Interface/interface";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { deleteEvent } from "@/store/eventSlice";
import { useRouter } from "next/navigation";
import { Calendar, LocateIcon, Trash } from "lucide-react";

import { getEventStatus } from "@/utils/helper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/StaticData/Static";
import MyPieChart from "./EventPieChart";

const EventOverView = ({ event }: { event: IEvent }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const handleDelete = () => {
    dispatch(deleteEvent(event._id));
    router.push("/dashboard");
  };
  const formattedDate = formatDate(event.date.toString());
  const [open, setOpen] = useState(false);

  const { budget = { allocated: 0, spent: 0 }, description, rsvp } = event;
  const remaining = budget.allocated - budget.spent;
  return (
    <div>
      <MyPieChart event={event} />
      {/* <div className="">
        <div className="flex gap-3 items-center mb-3">
          <h1 className="text-2xl text-white font-bold">{event.name}</h1>
          <p className="bg-blue-700 text-sm px-2 py-1 rounded-3xl ">
            {getEventStatus(event.date)}
          </p>
        </div>
        <div className="flex gap-3 mt-2 text-gray-300">
          <Calendar />
          <p>{formattedDate}</p>
        </div>
        <div className="flex gap-3 mt-2 text-gray-300">
          <LocateIcon />
          <p>{event.location}, 123 Beach Road</p>
        </div>

        <div className="mt-2">
          <Link href={`${event._id}/edit`}>
            <Button className="mr-4 cursor-pointer bg-blue-500 ">
              Edit Event
            </Button>
          </Link>
          <Button className="bg-transparent border cursor-pointer ">
            Send Invites
          </Button>
        </div>
      </div> */}
      <section className="bg-gray-800 mt-20 rounded-2xl p-4">
        <p className="text-blue-600 mb-3">Guest Summary</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span>Total Invited:</span> <span>{rsvp.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Confirmed:</span>{" "}
            <span className="text-green-700">{rsvp.confirmed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Pending:</span>{" "}
            <span className="text-amber-400">
              {rsvp.total - rsvp.confirmed}
            </span>
          </div>
        </div>
      </section>

      {/* Budget Summary */}
      <section className="bg-green-950 rounded-2xl mt-3 p-4">
        <p className="text-green-100 mb-3">Budget Summary</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span>Total Budget:</span>{" "}
            <span>₹{budget.allocated.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Spent:</span> <span>₹{budget.spent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Remaining:</span>{" "}
            <span className="text-blue-500">₹{remaining.toLocaleString()}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventOverView;
