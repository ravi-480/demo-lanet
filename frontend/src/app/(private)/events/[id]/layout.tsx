import { Metadata } from "next";
import axios from "../../../../utils/api";
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const cookieStore = cookies();

    const cookieHeader = (await cookieStore)
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await axios.get(`/events/${params.id}`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    const event = res.data.event;
    if (!event) return {};

    return {
      title: event.title || "Event Detail",
      description: event.description || "Event detail page",
      openGraph: {
        title: event.title,
        description: event.description,
        url: `/event/${params.id}`,
        type: "website",
      },
    };
  } catch (error) {
    return {};
  }
}

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
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await axios.get(`/events/${params.id}`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    const event = res.data.event;
    if (!event) return notFound();

    return <>{children}</>;
  } catch {
    return notFound();
  }
}
