import { useState } from "react";
import { isSameDay, parseISO, isFuture } from "date-fns";
import { IEvent, ProcessedEvent } from "@/Interface/interface";

export const useEventCalendar = (rawEvents: IEvent[]) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Process and filter events
  const eventsByDate = rawEvents
    .filter((event) => event?.date && event?.name)
    .map((event) => {
      try {
        const eventDate = parseISO(event.date.toString());
        if (isFuture(eventDate) || isSameDay(eventDate, new Date())) {
          return {
            id: event._id, // Include the event ID for navigation
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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const sameDayClicked = selectedDate && isSameDay(date, selectedDate);
    setSelectedDate(date);
    setIsPopoverOpen(!sameDayClicked || !isPopoverOpen);
  };

  return {
    selectedDate,
    selectedEvents,
    eventDates,
    isPopoverOpen,
    setIsPopoverOpen,
    handleDateSelect,
  };
};