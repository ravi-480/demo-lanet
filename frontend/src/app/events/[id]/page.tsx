import EventDetailClient from "@/app/Components/Events/EventDetailClient";

const EventDetail = ({ params }: { params: { id: string } }) => {
  return <EventDetailClient id={params.id} />;
};

export default EventDetail;
