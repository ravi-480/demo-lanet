import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EventDetailClient from "@/app/Components/Events/EventDetailClient";
import ErrorMessage from "@/app/Components/Error/ErrorMessage";

const EventDetail = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c: any) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetch(`http://localhost:5000/api/events/${id}`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      return <ErrorMessage message={"event not found"} />;
    }

    const data = await res.json();
    const event = data.event;

    // If no event is found in the response, trigger notFound
    if (!event) {
      return notFound();
    }

    // Return the client-side component with event details
    return <EventDetailClient id={id} />;
  } catch (error) {
    console.error("Fetch error:", error);
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Error loading event</h2>
        <p>Could not connect to the server. Please try again later.</p>
      </div>
    );
  }
};

export default EventDetail;
