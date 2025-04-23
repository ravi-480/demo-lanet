import LoadSpinner from "@/app/Components/Shared/LoadSpinner";
import dynamic from "next/dynamic";

const EventDetailClient = dynamic(() => import("@/app/Components/Events/EventDetailClient"), {
  loading: () => <LoadSpinner />,
});

export default function EventDetailPage({ params }: { params: { id: string } }) {
  return <EventDetailClient id={params.id} />;
}
