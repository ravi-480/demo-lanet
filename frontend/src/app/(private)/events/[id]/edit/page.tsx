"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchById, fetchEvents, updateEvent } from "@/store/eventSlice";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EventForm from "@/app/Components/Form/EventForm";
import LoadSpinner from "@/app/Components/Shared/LoadSpinner";

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { singleEvent: event } = useSelector((state: RootState) => state.event);

  useEffect(() => {
    if (!event || event._id !== id) {
      dispatch(fetchById(id));
    }
  }, [dispatch, id, event]);

  const handleSubmit = (formData: FormData) => {
    setIsLoading(true);

    dispatch(updateEvent({ id, formData }))
      .unwrap()
      .then(async () => {
        await dispatch(
          fetchEvents({
            page: 1,
            limit: 8,
            tab: "all",
            search: "",
            date: "",
            location: "",
          })
        );
        router.push("/events");
      })
      .catch((error: unknown) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!event) {
    return <LoadSpinner />;
  }

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
        <h1 className="text-2xl font-bold text-white">Edit Event</h1>
        <div className="w-24"></div> {/* Spacer for center alignment */}
      </div>

      <EventForm
        initialData={event}
        onSubmit={handleSubmit}
        isEditing={true}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditEventPage;
