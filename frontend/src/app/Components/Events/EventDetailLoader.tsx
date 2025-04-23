// app/Components/Events/EventDetailLoader.tsx
"use client";

import dynamic from "next/dynamic";
import LoadSpinner from "@/app/Components/Shared/LoadSpinner";

const EventDetailClient = dynamic(
  () => import("./EventDetailClient"),
  {
    loading: () => <LoadSpinner />,
    ssr: false,
  }
);

export default function EventDetailLoader({ id }: { id: string }) {
  return <EventDetailClient id={id} />;
}
