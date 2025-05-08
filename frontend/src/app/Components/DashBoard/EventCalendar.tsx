"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { selectEvents } from "@/store/eventSlice";
import { useSelector } from "react-redux";
import { useRef } from "react";
import { isSameDay, format } from "date-fns";
import { useEventCalendar } from "@/hooks/useEventCalendar";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const EventCalendar = () => {
  const events = useSelector(selectEvents) || [];
  const anchorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    selectedDate,
    selectedEvents,
    eventDates,
    isPopoverOpen,
    setIsPopoverOpen,
    handleDateSelect,
  } = useEventCalendar(events);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
    setIsPopoverOpen(false);
  };

  return (
    <motion.div
      className="w-full lg:w-auto h-full flex-shrink-0 lg:min-w-[320px] relative"
      ref={anchorRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: 0.3,
      }}
    >
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverAnchor asChild>
          <div />
        </PopoverAnchor>

        <AnimatePresence>
          {isPopoverOpen && (
            <PopoverContent
              align="center"
              side="top"
              sideOffset={10}
              className="w-72 bg-gray-800 text-white border-gray-700 z-50"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {selectedDate && (
                  <>
                    <h3 className="font-semibold mb-2 text-indigo-300">
                      {format(selectedDate, "MMMM d, yyyy")}
                    </h3>
                    {selectedEvents.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedEvents.map((event, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            onClick={() => handleEventClick(event.id)}
                            className="p-2 rounded hover:bg-gray-700 cursor-pointer transition-colors"
                          >
                            <div className="font-medium">{event.name}</div>
                            <div className="text-xs text-gray-300">
                              {event.location}
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-400">
                        No events scheduled
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </PopoverContent>
          )}
        </AnimatePresence>

        <motion.div
          className="calendar-container"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(108, 99, 255, 0.1)" }}
        >
          <Calendar
            modifiers={{
              hasEvent: (day) =>
                eventDates.some((eventDate) => isSameDay(day, eventDate)),
            }}
            modifiersClassNames={{
              hasEvent:
                "bg-indigo-600 text-white rounded-xl hover:bg-indigo-500",
              selected: "",
            }}
            className="rounded-lg border md:h-91 border-gray-400 w-full"
            onDayClick={handleDateSelect}
          />
        </motion.div>
      </Popover>
    </motion.div>
  );
};

export default EventCalendar;
