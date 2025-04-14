import { Calendar } from "@/components/ui/calendar";
import { selectEvents } from "@/store/eventSlice";
import { isSameDay, parseISO, isFuture } from "date-fns";
import { useSelector } from "react-redux";

const EventCalendar = () => {
  const events = useSelector(selectEvents);
  const dataArr = events
    .map((event) => {
      if (!event?.date) return null;
      try {
        return parseISO(event?.date?.toString());
      } catch (error) {
        console.log(error);
        return null;
      }
    })
    .filter((eventDate) => eventDate && isFuture(eventDate));

  return (
    <Calendar
      modifiers={{
        darken: (day) => dataArr.some((darkDate) => isSameDay(day, darkDate!)),
      }}
      modifiersClassNames={{
        darken: "text-gray-500 bg-gray-950 rounded-full",
      }}
      className="rounded-lg border "
    />
  );
};

export default EventCalendar;
