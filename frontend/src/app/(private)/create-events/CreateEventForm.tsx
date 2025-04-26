"use client";

import { createEvent } from "@/store/eventSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import EventForm from "@/app/Components/Form/EventForm";
import { toast } from "sonner";
import { AppDispatch } from "@/store/store";

const CreateEventForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleCreate = (data: FormData) => {
    dispatch(createEvent(data))
      .unwrap()
      .then(() => {
        toast.success("Event created successfuly");
        router.push("/events");
      })
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast.error(`Error creating event: ${errorMessage}`);
      });
  };

  return <EventForm onSubmit={handleCreate} />;
};

export default CreateEventForm;
