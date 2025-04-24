import LoadSpinner from "@/app/Components/Shared/LoadSpinner";
import dynamic from "next/dynamic";

const EventDetailClient = dynamic(() => import("@/app/Components/Events/EventDetailClient"), {
  loading: () => <LoadSpinner />,
});

export default async function EventDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  return <EventDetailClient id={id} />;
}
