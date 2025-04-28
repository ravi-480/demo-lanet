"use client";
import { Button } from "@/components/ui/button";
import { Calendar, LocateIcon, Trash } from "lucide-react";
import { IEvent } from "@/Interface/interface";
import { getEventStatus } from "@/utils/helper";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { deleteEvent } from "@/store/eventSlice";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { formatFullDateWithTime } from "@/StaticData/Static";
import ConfirmDialog from "../Shared/ConfirmDialog";

const EventHeader = ({ event }: { event: IEvent }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(() => {
    dispatch(deleteEvent(event._id))
      .unwrap()
      .then(() => {
        router.push("/events");
      })
      .catch(() => toast.error("Error deleting event"));
  }, [dispatch, event._id, router]);

  return (
    <>
      <section
        aria-labelledby="event-heading"
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-8 py-5 bg-gray-900 border mx-auto w-[95%] rounded-lg"
      >
        {/* Event Information */}
        <div className="flex flex-col space-y-2">
          <h1
            id="event-heading"
            className="text-xl sm:text-2xl text-white font-bold"
          >
            {event.name}
          </h1>

          <span className="bg-cyan-700/50 text-sm md:w-20 text-center rounded-3xl">
            {getEventStatus(event.date)}
          </span>

          <p className="flex items-center gap-2 text-gray-300 text-sm">
            <Calendar size={16} aria-hidden="true" />
            {formatFullDateWithTime(event.date.toString())}
          </p>

          <p className="flex items-center gap-2 text-gray-300 text-sm">
            <LocateIcon size={16} aria-hidden="true" />
            {event.location}, 123 Beach Road
          </p>

          <Link href={`${event._id}/edit`}>
            <Button className="mt-2 w-full sm:w-auto" aria-label="Edit Event">
              Edit Event
            </Button>
          </Link>
        </div>

        {/* Delete Button */}
        <div className="self-end  sm:self-auto">
          <Button
            onClick={() => setOpen(true)}
            className="bg-red-700 hover:bg-red-900 w-full sm:w-auto"
            aria-label="Delete Event"
          >
            Delete <Trash className="ml-2" size={16} />
          </Button>
        </div>
      </section>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        title="Are you absolutely sure?"
        description="This will permanently delete your Event and remove your data from our servers."
        confirmText="Delete Event"
        cancelText="Cancel"
        confirmClassName="bg-red-600 hover:bg-red-700"
      />
    </>
  );
};

export default EventHeader;
