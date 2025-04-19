"use client";

import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useEffect } from "react";
import { fetchById, singleEvent, updateEvent } from "@/store/eventSlice";
import EventForm from "@/app/Components/Form/EventForm";

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const event = useSelector(singleEvent);

  useEffect(() => {
    if (!event || event._id !== id) {
      dispatch(fetchById(id));
    }
  }, [dispatch, id, event]);

  const handleUpdate = (formData: FormData) => {
    dispatch(updateEvent(formData))
      .unwrap()
      .then(() => router.push("/dashboard"))
      .catch(console.error);
  };

  if (!event) return <p className="text-white">Loading...</p>;

  return <EventForm initialData={event} onSubmit={handleUpdate} isEditing />;
};

export default EditEvent;
