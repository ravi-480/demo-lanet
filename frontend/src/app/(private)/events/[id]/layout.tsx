import { ReactNode } from "react";
import { cookies } from "next/headers";
import {  redirect } from "next/navigation";
import ErrorMessage from "@/app/Components/Error/ErrorMessage";

export default async function EventLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c: any) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(`http://localhost:5000/api/events/${params.id}`, {
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
  } catch (error: any) {
    console.log("Layout fetch error:", error?.message || error);
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
