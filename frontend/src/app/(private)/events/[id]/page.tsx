import EventDetailClient from "@/app/Components/Events/EventDetailClient";

const EventDetailPage = ({ params }: { params: { id: string } }) => {
  return <EventDetailClient id={params.id} />;
};

export default EventDetailPage;
