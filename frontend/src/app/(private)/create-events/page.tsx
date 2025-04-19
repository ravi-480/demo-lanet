"use client";

import { storeEvent } from "@/store/eventSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import EventForm from "@/app/Components/Form/EventForm";

const CreateEventForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleCreate = (data: FormData) => {
    dispatch(storeEvent(data) as any)
      .unwrap()
      .then(() => {
        router.push("/dashboard");
      })
      .catch((err: any) => {
        console.error("Failed to create event:", err);
      });
  };

  return (
      <EventForm onSubmit={handleCreate} />
  );
};

export default CreateEventForm;
