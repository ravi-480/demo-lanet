"use client";
import { Button } from "@/components/ui/button";
import { Calendar, LocateIcon } from "lucide-react";
import React, { useEffect } from "react";
import { formatDate } from "@/StaticData/Static";
import { IEvent } from "@/Interface/interface";

const EventHeader = ({ event }: { event: IEvent }) => {
  const formattedDate = formatDate(event.date.toString());

  return (
    <div className="px-17 py-5 bg-blue-950 mx-auto w-[95%] rounded-lg">
      <div className="flex gap-3 items-center mb-3">
        <h1 className="text-2xl text-white font-bold">{event.name}</h1>
        <p className="bg-blue-700 text-sm px-2 py-1 rounded-3xl ">
          {event.status}
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
        <Button className="mr-4 cursor-pointer bg-blue-500 ">Edit Event</Button>
        <Button className="bg-transparent border cursor-pointer ">
          Send Invites
        </Button>
      </div>
    </div>
  );
};

export default EventHeader;
