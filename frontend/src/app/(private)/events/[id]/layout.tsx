import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ErrorMessage from "@/app/Components/Error/ErrorMessage";

export default async function EventLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  try {
    const headerList = await headers();
    const cookieHeader = headerList.get("cookie") || "";

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      redirect("/login");
    }

    if (res.status === 404) {
      return <ErrorMessage message="Event not found" />;
    }

    if (!res.ok) {
      throw new Error("Failed to fetch event data");
    }

    const data = await res.json();
    const event = data?.event;

    if (!event) {
      return <ErrorMessage message="Event not found" />;
    }

    return <>{children}</>;
  } catch (err) {
    console.log(err);

    return (
      <div className="p-6 text-center text-white bg-gray-900 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Error loading event</h2>
        <p className="text-gray-300">
          The server might be down. Please try again later.
        </p>
      </div>
    );
  }
}
