"use client";

import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useEffect } from "react";
import { fetchById, updateEvent } from "@/store/eventSlice";
import EventForm from "@/app/Components/Form/EventForm";
import { toast } from "sonner";

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { singleEvent: event } = useSelector((state: RootState) => state.event);

  useEffect(() => {
    if (!event || event._id !== id) {
      dispatch(fetchById(id));
    }
  }, [dispatch, id, event]);

  const handleUpdate = async (formData: FormData) => {
    dispatch(updateEvent(formData))
      .unwrap()
      .then(() => {
        toast.success("Event updated successfully");
        router.push("/events");
      })
      .catch((err: unknown) => {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to update event";

        toast.error(errorMessage);
      });
  };

  if (!event) return <p className="text-white">Loading...</p>;

  return <EventForm initialData={event} onSubmit={handleUpdate} isEditing />;
};

export default EditEvent;
