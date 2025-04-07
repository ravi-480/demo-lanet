"use client";

import { storeEvent } from "@/store/eventSlice";
import { useDispatch } from "react-redux";
import AuthGuard from "../Components/Home/AuthGuard/AuthGuard";
import { useRouter } from "next/navigation";
import EventForm from "../Components/Form/EventForm";

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
    <AuthGuard>
      <EventForm onSubmit={handleCreate} />
    </AuthGuard>
  );
};

export default CreateEventForm;
