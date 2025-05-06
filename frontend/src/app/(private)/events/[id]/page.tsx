import LoadSpinner from "@/app/Components/Shared/LoadSpinner";
import dynamic from "next/dynamic";

const EventDetailClient = dynamic(
  () => import("@/app/Components/Events/EventDetailClient"),
  {
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadSpinner />
        <span className="ml-3 text-cyan-400 text-lg animate-pulse">
          Loading event details...
        </span>
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
