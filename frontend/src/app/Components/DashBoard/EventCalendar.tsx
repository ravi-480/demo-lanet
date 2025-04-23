"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { selectEvents } from "@/store/eventSlice";
import { useSelector } from "react-redux";
import { useState, useRef } from "react";
import { isSameDay, parseISO, isFuture, format } from "date-fns";

const EventCalendar = () => {
  const events = useSelector(selectEvents) || [];
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const eventsByDate = events
    .filter((event) => event?.date && event?.name)
    .map((event) => {
      try {
        const eventDate = parseISO(event.date.toString());
        if (isFuture(eventDate) || isSameDay(eventDate, new Date())) {
          return {
            date: eventDate,
            name: event.name,
            location: event.location || "No location provided",
          };
        }
        return null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const eventDates = eventsByDate.map((event: any) => event.date);

  const selectedEvents = selectedDate
    ? eventsByDate.filter((event: any) => isSameDay(event.date, selectedDate))
    : [];

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setOpen(true);
  };

  return (
    <div
      className="w-full lg:w-auto h-full flex-shrink-0 lg:min-w-[320px] relative"
      ref={anchorRef}
    >
      <Popover open={open} onOpenChange={setOpen}>
        {/* Attach the popover to the calendar wrapper */}
        <PopoverAnchor asChild>
          <div />
        </PopoverAnchor>

        <PopoverContent
          align="center"
          side="top"
          sideOffset={10}
          className="w-72 bg-gray-800 text-white border-gray-700 shadow-lg z-50"
        >
          {selectedDate && (
            <>
              <h3 className="font-semibold mb-2">
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              {selectedEvents.length > 0 ? (
                <ul className="space-y-2">
                  {selectedEvents.map((event: any, index: number) => (
                    <li
                      key={index}
                      className="border border-gray-600 p-2 rounded bg-gray-700"
                    >
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

        <PopoverTrigger asChild>
          <div>
            <Calendar
              modifiers={{
                hasEvent: (day) =>
                  eventDates.some((eventDate) => isSameDay(day, eventDate)),
              }}
              modifiersClassNames={{
                hasEvent:
                  "text-gray-100 bg-cyan-300/50 hover:bg-cyan-300/40 hover:text-white rounded-md",
              }}
              className="rounded-lg border h-93 border-gray-400 w-full"
              selected={selectedDate ?? undefined}
              onDayClick={handleDayClick}
              mode="single"
            />
          </div>
        </PopoverTrigger>
      </Popover>
    </div>
  );
};

export default EventCalendar;
