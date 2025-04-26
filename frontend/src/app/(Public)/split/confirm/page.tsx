import ConfirmCard from "@/app/Components/Payment/ConfirmCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm Payment",
};

export default function Confirm({
  searchParams,
}: {
  searchParams: { eventId?: string; userId?: string };
}) {
  const { eventId, userId } = searchParams;

  if (!eventId || !userId) {
    return <p className="text-red-500">Invalid link</p>;
  }

  return (
    <div className="flex justify-center items-center m-4">
      <ConfirmCard userId={userId} eventId={eventId} />
    </div>
  );
}
