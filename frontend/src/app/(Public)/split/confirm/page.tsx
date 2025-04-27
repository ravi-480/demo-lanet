import ConfirmCard from "@/app/Components/Payment/ConfirmCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Confirm Payment",
};

interface ConfirmProps {
  searchParams: Promise<{ eventId?: string; userId?: string }>;
}

const Confirm = async ({ searchParams }: ConfirmProps) => {
  const { eventId, userId } = await searchParams;

  if (!eventId || !userId) {
    return <p className="text-red-500">Invalid link</p>;
  }

  return (
    <div className="flex justify-center items-center m-4">
      <ConfirmCard userId={userId} eventId={eventId} />
    </div>
  );
};

export default Confirm;
