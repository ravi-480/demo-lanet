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
import { RootState } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";
import { eventTypeOptions, IEvent } from "@/Interface/interface";

const eventFormSchema = z.object({
  name: z.string().min(1, { message: "Event name is required" }),
  date: z.string().min(1, { message: "Event Date is required " }),
  location: z.string().min(1, { message: "Event location is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  budget: z.coerce.number().min(0, { message: "Budget must be positive" }),
  guestLimit: z.coerce
    .number()
    .min(0, { message: "Number of guest atleast 1" }),
  eventType: z.string().min(1, { message: "Event type is required" }),
  durationInDays: z.coerce.number().min(1, { message: "Duration is required" }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: Partial<IEvent>;
  onSubmit: (data: FormData) => void;
  isEditing?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
}) => {
  const { isLoading } = useSelector((state: RootState) => state.event);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ?? null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      date: initialData?.date
        ? new Date(initialData.date).toISOString().slice(0, 16)
        : "",
      location: initialData?.location || "",
      description: initialData?.description || "",
      budget: initialData?.budget?.allocated || 0,
      guestLimit: initialData?.guestLimit || 0,
      eventType: initialData?.eventType || "",
      durationInDays: initialData?.durationInDays || 1,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submitHandler = (data: EventFormValues) => {
    const formData = new FormData();
    console.log("sdsdsds", data);

    Object.entries(data).forEach(([key, value]) =>
      formData.append(key, String(value))
    );

    if (imageFile) formData.append("image", imageFile);

    if (initialData?._id) formData.append("eventId", initialData._id); // for edit

    onSubmit(formData);
  };

  return (
    <div className="bg-gray-900 border  max-w-2xl mx-auto p-6 m-4 rounded-lg">
      <h1 className="text-center font-bold mb-6 text-white">
        {isEditing ? "Edit Event" : "Create New Event"}
      </h1>

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="mt-4">
          <Label className="mb-2" htmlFor="name">
            Event Name
          </Label>
          <Input {...register("name")} id="name" />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="date">
            Event Date
          </Label>
          <Input {...register("date")} id="date" type="datetime-local" />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="location">
            Location
          </Label>
          <Input {...register("location")} id="location" />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="image">
            Upload Image
          </Label>
          <Input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 border rounded"
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="description">
            Description
          </Label>
          <Textarea {...register("description")} id="description" />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="budget">
            Budget
          </Label>
          <Input {...register("budget")} id="budget" type="number" />
          {errors.budget && (
            <p className="text-red-500 text-sm">{errors.budget.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="guestLimit">
            Guest Limit
          </Label>
          <Input {...register("guestLimit")} id="guestLimit" type="number" />
          {errors.guestLimit && (
            <p className="text-red-500 text-sm">{errors.guestLimit.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="eventType">
            Event Type
          </Label>
          <Select
            onValueChange={(value) => setValue("eventType", value)}
            defaultValue={initialData?.eventType || ""}
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
          <input type="hidden" {...register("eventType")} />
          {errors.eventType && (
            <p className="text-red-500 text-sm">{errors.eventType.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="durationInDays">
            Duration (in Days)
          </Label>
          <Input
            {...register("durationInDays")}
            id="durationInDays"
            type="number"
          />
          {errors.durationInDays && (
            <p className="text-red-500 text-sm">
              {errors.durationInDays.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-6 bg-amber-100 text-black hover:bg-amber-200"
          disabled={isLoading}
        >
          {isLoading
            ? "Submitting..."
            : isEditing
            ? "Update Event"
            : "Create Event"}
        </Button>
      </form>
    </div>
  );
};

export default EventForm;
