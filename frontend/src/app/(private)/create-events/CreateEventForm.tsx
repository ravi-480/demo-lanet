"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch } from "@/store/store";
import { createEvent } from "@/store/eventSlice";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EventForm from "@/app/Components/Form/EventForm";

const CreateEventPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setIsLoading(true);

    dispatch(createEvent(formData))
      .unwrap()
      .then(() => {
        router.push("/events");
      })
      .catch((error: unknown) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <Link href="/events">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            ← Back to Events
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">Create New Event</h1>
        <div className="w-24"></div> {/* Spacer for center alignment */}
      </div>

      <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default CreateEventPage;
