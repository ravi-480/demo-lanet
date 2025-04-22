import { Button } from "@/components/ui/button";
import { Calendar, LocateIcon, Trash } from "lucide-react";
import { formatDate } from "@/StaticData/Static";
import { IEvent } from "@/Interface/interface";
import { getEventStatus } from "@/utils/helper";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { deleteEvent } from "@/store/eventSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const EventHeader = ({ event }: { event: IEvent }) => {
  const formattedDate = formatDate(event.date.toString());
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleDelete = () => {
    dispatch(deleteEvent(event._id))
      .unwrap()
      .then(() => {
        toast.success("Event Deleted successfully");
        router.push("/events");
      })
      .catch((err) => {
        toast.error("Error deleting event", err);
      });
  };

  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-8 py-5 bg-gray-900 border mx-auto w-[95%] rounded-lg">
      {/* Left Section */}
      <div className="flex flex-col space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl sm:text-2xl text-white font-bold">
            {event.name}
          </h1>
          <p className="bg-cyan-700/50 text-sm px-2 py-1 rounded-3xl">
            {getEventStatus(event.date)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <Calendar size={16} />
          <p>{formattedDate}</p>
        </div>

        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <LocateIcon size={16} />
          <p>{event.location}, 123 Beach Road</p>
        </div>

        <div>
          <Link href={`${event._id}/edit`}>
            <Button className="mt-2 w-full sm:w-auto">Edit Event</Button>
          </Link>
        </div>
      </div>

      {/* Right Section - Delete Button */}
      <div className="self-end sm:self-auto">
        <Button
          onClick={() => setOpen(true)}
          className="bg-red-700 hover:bg-red-900 w-full sm:w-auto"
        >
          Delete <Trash className="ml-2" size={16} />
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 font-semibold">
              This will permanently delete your Event and remove your data from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-black cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-cyan-600 hover:bg-cyan-700 cursor-pointer"
              onClick={handleDelete}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventHeader;
