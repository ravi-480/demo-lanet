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
const EventCalendar = () => {
  const events = useSelector(selectEvents) || [];
  const anchorRef = useRef<HTMLDivElement>(null);

  const {
    selectedDate,
    selectedEvents,
    eventDates,
    isPopoverOpen,
    setIsPopoverOpen,
    handleDateSelect,
  } = useEventCalendar(events);

  return (
    <div
      className="w-full lg:w-auto h-full flex-shrink-0 lg:min-w-[320px] relative"
      ref={anchorRef}
    >
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverAnchor asChild>
          <div />
        </PopoverAnchor>

        <PopoverContent
          align="center"
          side="top"
          sideOffset={10}
          className="w-72 bg-gray-800 text-white border-gray-700 z-50"
        >
          {selectedDate && (
            <>
              <h3 className="font-semibold mb-2">
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              {selectedEvents.length > 0 ? (
                <ul className="space-y-2">
                  {selectedEvents.map((event, index: number) => (
                    <li key={index}>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-xs text-gray-300">
                        {event.location}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-400">No events scheduled</div>
              )}
            </>
          )}
        </PopoverContent>

        <div className="calendar-container">
          <Calendar
            modifiers={{
              hasEvent: (day) =>
                eventDates.some((eventDate: string | number | Date) =>
                  isSameDay(day, eventDate)
                ),
            }}
            modifiersClassNames={{
              hasEvent: "bg-cyan-500 text-white rounded-xl",
              selected: "",
            }}
            className="rounded-lg border md:h-91 border-gray-400 w-full [&_.day-selected]:bg-transparent [&_.day-selected]:text-inherit"
            selected={undefined}
            mode="single"
            onDayClick={handleDateSelect}
          />
        </div>
      </Popover>
    </div>
  );
};

export default EventCalendar;
