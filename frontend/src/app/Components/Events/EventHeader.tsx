"use client";
import { Button } from "@/components/ui/button";
import { Calendar, LocateIcon, Trash, Edit3 } from "lucide-react";
import { IEvent } from "@/Interface/interface";
import { getEventStatus, getStatusColor } from "@/utils/helper";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { deleteEvent, fetchEvents } from "@/store/eventSlice";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { formatFullDateWithTime } from "@/StaticData/Static";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { motion } from "framer-motion";

const EventHeader = ({ event }: { event: IEvent }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    try {
      await dispatch(deleteEvent(event._id)).unwrap();

      await dispatch(
        fetchEvents({
          page: 1,
          limit: 8,
          tab: "all",
          search: "",
          date: "",
          location: "",
        })
      ).unwrap();

      router.push("/events");
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, event._id, router]);

  const status = getEventStatus(event.date);
  const statusClass = getStatusColor(status);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <motion.section
        aria-labelledby="event-heading"
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 sm:p-8 
                   bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 border 
                   mx-auto w-[95%] rounded-xl shadow-lg backdrop-blur-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Event Information */}
        <div className="flex flex-col space-y-3">
          <motion.h1
            id="event-heading"
            className="text-2xl sm:text-3xl text-white font-bold"
            variants={childVariants}
          >
            {event.name}
          </motion.h1>

          <motion.span
            className={`${statusClass} text-sm px-4 py-1 rounded-full w-fit`}
            variants={childVariants}
          >
            {status}
          </motion.span>

          <motion.p
            className="flex items-center gap-2 text-gray-300 text-sm"
            variants={childVariants}
          >
            <Calendar size={16} className="text-cyan-400" aria-hidden="true" />
            {formatFullDateWithTime(event.date.toString())}
          </motion.p>

          <motion.p
            className="flex items-center gap-2 text-gray-300 text-sm"
            variants={childVariants}
          >
            <LocateIcon
              size={16}
              className="text-cyan-400"
              aria-hidden="true"
            />
            {event.location}
          </motion.p>

          <motion.div className="mt-2 flex gap-2" variants={buttonVariants}>
            <Link
              href={`${event._id}/edit`}
              className="flex-grow sm:flex-grow-0"
            >
              <Button
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-800 transition-colors duration-300"
                aria-label="Edit Event"
              >
                <Edit3 className="mr-2" size={16} />
                Edit Event
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Delete Button */}
        <motion.div className="self-end sm:self-auto" variants={buttonVariants}>
          <Button
            onClick={() => setOpen(true)}
            className="bg-red-700/80 hover:bg-red-800 transition-colors duration-300 w-full sm:w-auto shadow-md"
            aria-label="Delete Event"
          >
            Delete <Trash className="ml-2" size={16} />
          </Button>
        </motion.div>
      </motion.section>

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
