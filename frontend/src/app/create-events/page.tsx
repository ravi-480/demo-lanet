"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storeEvent } from "@/store/eventSlice";
import { RootState } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import AuthGuard from "../Components/Home/AuthGuard/AuthGuard";
import { useRouter } from "next/navigation";
import { eventTypeOptions } from "@/Types/type";

const eventFormSchema = z.object({
  name: z.string().min(1, { message: "Event name is required" }),
  date: z.string().min(1, { message: "Event Date is required " }),
  location: z.string().min(1, { message: "Event location is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  budget: z.coerce
    .number()
    .min(0, { message: "Budget must be positive number" }),
  guestLimit: z.coerce
    .number()
    .min(0, { message: "Number of guest atleast 1" }),
  eventType: z.string().min(1, { message: "Event type is required" }),
  durationInDays: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 day" }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const EventForm = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.event);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      date: "",
      location: "",
      description: "",
      budget: 0,
      guestLimit: 0,
      eventType: "",
      durationInDays: 1,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImageFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setImagePreview(objectUrl);
    }
  };

  const onSubmit = (data: EventFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    dispatch(storeEvent(formData) as any)
      .unwrap()
      .then(() => {
        reset();
        setImageFile(null);
        setImagePreview(null);
        router.push("/dashboard");
      })
      .catch((err: any) => {
        console.error("Failed to create event:", err);
      });
  };

  return (
    <AuthGuard>
      <div className="bg-blue-950 max-w-2xl p-6 mx-auto mt-4 rounded-lg">
        <h1 className="text-center font-bold mb-6 text-white">
          Create New Event
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4">
            <Label htmlFor="name">Event Name</Label>
            <Input
              {...register("name")}
              id="name"
              className="py-1 font-semibold"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="date">Event Date</Label>
            <Input
              {...register("date")}
              id="date"
              type="datetime-local"
              className="py-1 cursor-pointer"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="location">Location</Label>
            <Input
              {...register("location")}
              id="location"
              type="text"
              className="py-1"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="image">Upload Image</Label>
            <Input
              accept="image/*"
              id="image"
              type="file"
              onChange={handleImageChange}
              className="py-1 cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="max-h-48 object-contain border rounded"
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="description">Description</Label>
            <Textarea {...register("description")} id="description" />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="budget">Budget</Label>
            <Input {...register("budget")} id="budget" type="number" min="0" />
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">
                {errors.budget.message}
              </p>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="guestLimit">Maximum Number of Guests</Label>
            <Input
              {...register("guestLimit")}
              id="guestLimit"
              type="number"
              min="0"
              className="py-1"
            />
            {errors.guestLimit && (
              <p className="text-red-500 text-sm mt-1">
                {errors.guestLimit.message}
              </p>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              onValueChange={(value: string) => setValue("eventType", value)}
              defaultValue=""
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("eventType")} id="eventType" />
            {errors.eventType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.eventType.message}
              </p>
            )}
          </div>

          {/* New: Duration in Days */}
          <div className="mt-4">
            <Label htmlFor="durationInDays">Duration (in Days)</Label>
            <Input
              {...register("durationInDays")}
              id="durationInDays"
              type="number"
              min={1}
              className="py-1"
            />
            {errors.durationInDays && (
              <p className="text-red-500 text-sm mt-1">
                {errors.durationInDays.message}
              </p>
            )}
          </div>

          <Button
            disabled={isLoading}
            type="submit"
            className="w-full cursor-pointer mt-6"
          >
            {isLoading ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </div>
    </AuthGuard>
  );
};

export default EventForm;
