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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EventHeader = ({ event }: { event: IEvent }) => {
  const formattedDate = formatDate(event.date.toString());
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const handleDelete = () => {
    dispatch(deleteEvent(event._id));
    router.push("/dashboard");
  };

  const [open, setOpen] = useState(false);

  return (
    <div className="flex px-17 py-5 bg-gray-900 border mx-auto w-[95%] justify-between rounded-lg">
      <div className="">
        <div className="flex gap-3 items-center mb-3">
          <h1 className="text-2xl text-white font-bold">{event.name}</h1>
          <p className="bg-blue-700 text-sm px-2 py-1 rounded-3xl ">
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
            <Button className="mr-4 cursor-pointer bg-blue-500 ">
              Edit Event
            </Button>
          </Link>
          <Button className="bg-transparent border cursor-pointer ">
            Send Invites
          </Button>
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-none text-black cursor-pointer" onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer" onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventHeader;
