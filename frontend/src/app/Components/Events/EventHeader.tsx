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
        toast.success("Event Deleted successfuly"), router.push("/events");
      })
      .catch((err) => {
        toast.error("error", err);
      });
  };

  const [open, setOpen] = useState(false);

  return (
    <div className="flex px-17 py-5 bg-gray-900 border mx-auto w-[95%] justify-between rounded-lg">
      <div className="">
        <div className="flex gap-3 items-center mb-3">
          <h1 className="text-2xl text-white font-bold">{event.name}</h1>
          <p className="bg-cyan-700/50 text-sm px-2 py-1 rounded-3xl ">
            {getEventStatus(event.date)}
          </p>
        </div>
        <div className="flex gap-3 mt-2 text-gray-300">
          <Calendar />
          <p>{formattedDate}</p>
        </div>
        <div className="flex gap-3 mt-2 text-gray-300">
          <LocateIcon />
          <p>{event.location}, 123 Beach Road</p>
        </div>

        <div className="mt-2">
          <Link href={`${event._id}/edit`}>
            <Button className="cursor-pointer ">Edit Event</Button>
          </Link>
        </div>
      </div>

      <Button
        onClick={() => setOpen(true)}
        className="bg-red-700 hover:bg-red-900 cursor-pointer"
      >
        Delete <Trash />
      </Button>

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
              className="hover:bg-none text-black cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-cyan-600 hover:bg-cyan-700"
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
