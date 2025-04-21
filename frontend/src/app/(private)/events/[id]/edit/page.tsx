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
        toast.success("Event update successfuly"), router.push("/events");
      })
      .catch((err: any) => {
        toast.error(err?.message || "Failed to update event");
      });
  };

  if (!event) return <p className="text-white">Loading...</p>;

  return <EventForm initialData={event} onSubmit={handleUpdate} isEditing />;
};

export default EditEvent;
