"use client";
import { Button } from "@/components/ui/button";
import { Calendar, LocateIcon, Trash, Edit3 } from "lucide-react";
import { IEvent } from "@/Interface/interface";
import { getEventStatus } from "@/utils/helper";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { deleteEvent } from "@/store/eventSlice";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { formatFullDateWithTime } from "@/StaticData/Static";
import ConfirmDialog from "../Shared/ConfirmDialog";

const EventHeader = ({ event }: { event: IEvent }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleDelete = useCallback(() => {
    dispatch(deleteEvent(event._id))
      .unwrap()
      .then(() => {
        router.push("/events");
      })
      .catch(() => toast.error("Error deleting event"));
  }, [dispatch, event._id, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-cyan-700/50 text-cyan-200";
      case "In Progress":
        return "bg-green-700/50 text-green-200";
      case "Completed":
        return "bg-purple-700/50 text-purple-200";
      default:
        return "bg-gray-700/50 text-gray-200";
    }
  };

  const status = getEventStatus(event.date);
  const statusClass = getStatusColor(status);

  return (
    <>
      <section
        aria-labelledby="event-heading"
        className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 sm:p-8 
                   bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 border 
                   mx-auto w-[95%] rounded-xl shadow-lg backdrop-blur-sm 
                   transition-all duration-500 ease-in-out transform
                   ${
                     isVisible
                       ? "opacity-100 translate-y-0"
                       : "opacity-0 translate-y-4"
                   }`}
      >
        {/* Event Information */}
        <div className="flex flex-col space-y-3">
          <h1
            id="event-heading"
            className={`text-2xl sm:text-3xl text-white font-bold 
                      transition-all duration-700 delay-100
                      ${
                        isVisible
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-4"
                      }`}
          >
            {event.name}
          </h1>

          <span
            className={`${statusClass} text-sm px-4 py-1 rounded-full w-fit 
                          transition-all duration-700 delay-200
                          ${
                            isVisible
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-4"
                          }`}
          >
            {status}
          </span>

          <p
            className={`flex items-center gap-2 text-gray-300 text-sm
                       transition-all duration-700 delay-300
                       ${
                         isVisible
                           ? "opacity-100 translate-x-0"
                           : "opacity-0 -translate-x-4"
                       }`}
          >
            <Calendar size={16} className="text-cyan-400" aria-hidden="true" />
            {formatFullDateWithTime(event.date.toString())}
          </p>

          <p
            className={`flex items-center gap-2 text-gray-300 text-sm
                       transition-all duration-700 delay-400
                       ${
                         isVisible
                           ? "opacity-100 translate-x-0"
                           : "opacity-0 -translate-x-4"
                       }`}
          >
            <LocateIcon
              size={16}
              className="text-cyan-400"
              aria-hidden="true"
            />
            {event.location}, 123 Beach Road
          </p>

          <div
            className={`mt-2 flex gap-2
                         transition-all duration-700 delay-500
                         ${
                           isVisible
                             ? "opacity-100 translate-y-0"
                             : "opacity-0 translate-y-4"
                         }`}
          >
            <Link
              href={`${event._id}/edit`}
              className="flex-grow sm:flex-grow-0"
            >
              <Button
                className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-800 transition-colors duration-300"
                aria-label="Edit Event"
              >
                <Edit3 className="mr-2" size={16} />
                Edit Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Delete Button */}
        <div
          className={`self-end sm:self-auto
                        transition-all duration-700 delay-600
                        ${
                          isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
        >
          <Button
            onClick={() => setOpen(true)}
            className="bg-red-700/80 hover:bg-red-800 transition-colors duration-300 w-full sm:w-auto shadow-md"
            aria-label="Delete Event"
          >
            Delete <Trash className="ml-2" size={16} />
          </Button>
        </div>
      </section>

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

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default EventHeader;
