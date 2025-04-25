"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { selectEvents } from "@/store/eventSlice";
import { useSelector } from "react-redux";
import { useState, useRef } from "react";
import { isSameDay, parseISO, isFuture, format } from "date-fns";

interface ProcessedEvent {
  date: Date;
  name: string;
  location: string;
}

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
    .filter(Boolean) as ProcessedEvent[];

  const eventDates = eventsByDate.map((event: ProcessedEvent) => event.date);

  const selectedEvents = selectedDate
    ? eventsByDate.filter((event: ProcessedEvent) =>
        isSameDay(event.date, selectedDate)
      )
    : [];

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const sameDayClicked = selectedDate && isSameDay(date, selectedDate);
    setSelectedDate(date);
    setOpen(!sameDayClicked || !open);
  };

  return (
    <div
      className="w-full lg:w-auto h-full flex-shrink-0 lg:min-w-[320px] relative"
      ref={anchorRef}
    >
      <Popover open={open} onOpenChange={setOpen}>
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
                  {selectedEvents.map(
                    (event: ProcessedEvent, index: number) => (
                      <li key={index}>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-xs text-gray-300">
                          {event.location}
                        </div>
                      </li>
                    )
                  )}
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
                eventDates.some((eventDate) => isSameDay(day, eventDate)),
            }}
            modifiersClassNames={{
              hasEvent: "bg-cyan-500 text-white rounded-xl",
              selected: "", // no selected style
            }}
            className="rounded-lg border md:h-91 border-gray-400 w-full [&_.day-selected]:bg-transparent [&_.day-selected]:text-inherit"
            selected={undefined} // no visual selection
            mode="single"
            onDayClick={handleSelect}
          />
        </div>
      </Popover>
    </div>
  );
};

export default EventCalendar;
