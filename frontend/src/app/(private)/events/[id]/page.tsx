import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EventDetailClient from "@/app/Components/Events/EventDetailClient";

const EventDetail = async ({ params }: { params: { id: string } }) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c: any) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetch(`http://localhost:5000/api/events/${params.id}`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    // Handle various response statuses
    if (!res.ok) {
      // For 404s use notFound
      if (res.status === 404) {
        return notFound();
      }

      // For other errors, show an error component
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold">Error loading event</h2>
          <p>Could not load the event data. Status: {res.status}</p>
        </div>
      );
    }

    const data = await res.json();
    const event = data.event;

    if (!event) {
      return notFound();
    }

    return <EventDetailClient id={params.id} />;
  } catch (error) {
    console.error("Fetch error:", error);
    // For network errors, show an error component
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Error loading event</h2>
        <p>Could not connect to the server. Please try again later.</p>
      </div>
    );
  }
};

export default EventDetail;
