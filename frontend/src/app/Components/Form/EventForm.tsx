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
import Image from "next/image";

// Enhanced Zod schema with better validations
const eventFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Event name is required" })
    .max(20, { message: "Title cannot be longer than 20 character" })
    .refine((value) => !/^\d+$/.test(value), {
      message: "Event name cannot contain only numbers",
    }),
  date: z
    .string()
    .min(1, { message: "Event Date is required" })
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "Please provide a valid date",
    }),
  location: z
    .string()
    .min(3, { message: "Event location is required" })
    .max(20),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(200),
  budget: z.coerce
    .number()
    .min(1, { message: "Budget must be at least 1" })
    .max(1_00_00_000, { message: "Budget cannot exceed ₹1 crore" })
    .nonnegative({ message: "Budget cannot be negative" }),
  guestLimit: z.coerce
    .number()
    .min(1, { message: "Number of guests must be at least 1" })
    .max(10000, { message: "Guest limit cannot be exceed 10000" })
    .nonnegative({ message: "Guest limit cannot be negative" }),
  eventType: z.string().min(1, { message: "Event type is required" }),
  durationInDays: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 day" })
    .max(30, { message: "Duration cannot be more than 30" })
    .nonnegative({ message: "Duration cannot be negative" }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: Partial<IEvent>;
  onSubmit: (data: FormData) => void;
  isEditing?: boolean;
}

// Helper function to properly format dates for input fields
const formatDateForInput = (dateString?: string | Date): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const istOffset = 5.5 * 60;
    const localTime = new Date(date.getTime() + istOffset * 60000);
    const iso = localTime.toISOString();
    return iso.slice(0, 16);
  } catch (e) {
    console.log(e);
    return "";
  }
};

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
      date: formatDateForInput(initialData?.date),
      location: initialData?.location || "",
      description: initialData?.description || "",
      budget: initialData?.budget?.allocated || undefined, 
      guestLimit: initialData?.guestLimit || undefined, 
      eventType: initialData?.eventType || "",
      durationInDays: initialData?.durationInDays || 1,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
console.log(file);

    if (!validImageTypes.includes(file.type)) {
      alert("Only JPEG, PNG, or WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    console.log(URL.createObjectURL);
    
  };

  const submitHandler = (data: EventFormValues) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (
        ["budget", "guestLimit", "durationInDays"].includes(key) &&
        value !== undefined
      ) {
        formData.append(key, String(Number(value)));
      } else {
        formData.append(key, String(value));
      }
    });

    if (imageFile) formData.append("image", imageFile);
    if (initialData?._id) formData.append("eventId", initialData._id);

    onSubmit(formData);
  };

  return (
    <div className="bg-gray-900 border max-w-2xl mx-auto p-6 m-4 rounded-lg">
      <h1 className="text-center font-bold mb-6 text-white">
        {isEditing ? "Edit Event" : "Create New Event"}
      </h1>

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="mt-4">
          <Label className="mb-2" htmlFor="name">
            Event Name
          </Label>
          <Input
            {...register("name")}
            id="name"
            onKeyDown={(e) => {
              if (/\d/.test(e.key)) {
                e.preventDefault(); // block number keys
              }
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (/\d/.test(pasted)) {
                e.preventDefault(); // block pasting numbers
              }
            }}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="date">
            Event Date
          </Label>
          <Input
            min={formatDateForInput(new Date())}
            className="text-white [&::-webkit-calendar-picker-indicator]:invert"
            {...register("date")}
            defaultValue={formatDateForInput(initialData?.date)}
            id="date"
            type="datetime-local"
          />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="location">
            Location
          </Label>
          <Input
            {...register("location")}
            id="location"
            onKeyDown={(e) => {
              if (/\d/.test(e.key)) {
                e.preventDefault(); // block number keys
              }
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (/\d/.test(pasted)) {
                e.preventDefault(); // block pasting numbers
              }
            }}
          />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="image">
            Upload Image
          </Label>
          <Input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="file:text-white"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="mt-2">
              <Image
                width={200}
                height={200}
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
          <Input
            {...register("budget")}
            id="budget"
            type="number"
            min="1"
            max="10000000"
            placeholder="Enter event budget"
          />
          {errors.budget && (
            <p className="text-red-500 text-sm">{errors.budget.message}</p>
          )}
        </div>

        <div className="mt-4">
          <Label className="mb-2" htmlFor="guestLimit">
            Guest Limit
          </Label>
          <Input
            {...register("guestLimit")}
            id="guestLimit"
            type="number"
            min="1"
            max="10000"
            placeholder="Enter guest limit"
          />
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
            min="1"
            max="30"
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
