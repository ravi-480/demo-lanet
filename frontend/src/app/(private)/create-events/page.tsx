"use client";

import { createEvent } from "@/store/eventSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import EventForm from "@/app/Components/Form/EventForm";
import { toast } from "sonner";

const CreateEventForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleCreate = (data: FormData) => {
    dispatch(createEvent(data) as any)
      .unwrap()
      .then(() => {
        toast.success("Event created successfuly");
        router.push("/events");
      })
      .catch((err: any) => {
        toast.error("error", err);
      });
  };

  return <EventForm onSubmit={handleCreate} />;
};

export default CreateEventForm;
