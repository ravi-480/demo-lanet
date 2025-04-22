import { Calendar } from "@/components/ui/calendar";
import { selectEvents } from "@/store/eventSlice";
import { isSameDay, parseISO, isFuture } from "date-fns";
import { useSelector } from "react-redux";

const EventCalendar = () => {
  const events = useSelector(selectEvents) || [];

  const dataArr = events
    .map((event) => {
      if (!event?.date) return null;
      try {
        return parseISO(event?.date?.toString());
      } catch (error) {
        return null;
      }
    })
    .filter((eventDate) => eventDate && isFuture(eventDate));

  return (
    <div className="w-full lg:w-auto h-full flex-shrink-0 lg:min-w-[320px]">
      <Calendar
        modifiers={{
          darken: (day) =>
            dataArr.some((darkDate) => isSameDay(day, darkDate!)),
        }}
        modifiersClassNames={{
          darken:
            "text-gray-100 bg-cyan-300/50 hover:bg-cyan-300/40 hover:text-white rounded-5xl",
        }}
        className="rounded-lg border border-gray-400 w-full  h-93"
      />
    </div>
  );
};

export default EventCalendar;
