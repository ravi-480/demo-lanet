import ConfirmCard from "@/app/Components/Payment/ConfirmCard";
import React from "react";

const Confirm = ({
  searchParams,
}: {
  searchParams: { eventId?: string; userId?: string };
}) => {
  if (!searchParams.eventId || !searchParams.userId) {
    return <p className="text-red-500">Invalid link</p>;
  }


  return (
    <div className="flex justify-center items-center m-4 ">
      <ConfirmCard
        userId={searchParams.userId}
        eventId={searchParams.eventId}
      />
    </div>
  );
};

export default Confirm;
