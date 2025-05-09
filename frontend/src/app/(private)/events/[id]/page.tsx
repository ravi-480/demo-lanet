import LoadSpinner from "@/app/Components/Shared/LoadSpinner";
import dynamic from "next/dynamic";

const EventDetailClient = dynamic(
  () => import("@/app/Components/Events/EventDetailClient"),
  {
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadSpinner />
      </div>
    ),
  }
);

export default async function EventDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;

  return <EventDetailClient id={id} />;
}
