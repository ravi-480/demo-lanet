"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { z } from "zod";
import { eventFormSchema } from "@/schemas/ValidationSchema";
import { eventTypeOptions, IEvent } from "@/Interface/interface";
import {
  allowOnlyLetters,
  filterPastedLetters,
  formatDateForInput,
} from "@/utils/helper";
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
import {
  Calendar,
  MapPin,
  Image as ImageIcon,
  Clock,
  Users,
  DollarSign,
  Type,
} from "lucide-react";

interface EventFormProps {
  initialData?: Partial<IEvent>;
  onSubmit: (data: FormData) => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

// Create a modified schema for the form that matches your defaults
type EventFormValues = z.infer<typeof eventFormSchema>;

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
  isLoading = false,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ?? null
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      date: formatDateForInput(initialData?.date) || "",
      location: initialData?.location || "",
      description: initialData?.description || "",
      budget: initialData?.budget?.allocated || 0, // Default to 0
      guestLimit: initialData?.guestLimit || 0, // Default to 0
      eventType: initialData?.eventType || "",
      durationInDays: initialData?.durationInDays || 1,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validImageTypes.includes(file.type)) {
      alert("Only JPEG, PNG, or WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        className={`w-full max-w-3xl ${
          isVisible ? "animate-fade-in animation-delay-300" : "opacity-0"
        }`}
      >
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-white text-center mb-6">
              {isEditing ? "Edit Event" : "Create New Event"}
            </h1>

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center text-white">
                  <Type size={18} className="mr-2 text-[#6c63ff]" />
                  Event Name
                </Label>
                <Input
                  {...register("name")}
                  id="name"
                  placeholder="Enter event name"
                  className="bg-gray-900 border-gray-700 focus:border-[#6c63ff] focus:ring-[#6c63ff] text-white"
                  onKeyDown={allowOnlyLetters}
                  onPaste={filterPastedLetters}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="flex items-center text-white"
                  >
                    <Calendar size={18} className="mr-2 text-[#6c63ff]" />
                    Event Date
                  </Label>
                  <Input
                    min={formatDateForInput(new Date())}
                    className="bg-gray-900 border-gray-700 focus:border-[#6c63ff] focus:ring-[#6c63ff] text-white [&::-webkit-calendar-picker-indicator]:invert"
                    {...register("date")}
                    id="date"
                    type="datetime-local"
                  />
                  {errors.date && (
                    <p className="text-red-400 text-sm">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="flex items-center text-white"
                  >
                    <MapPin size={18} className="mr-2 text-[#6c63ff]" />
                    Location
                  </Label>
                  <Input
                    {...register("location")}
                    id="location"
                    placeholder="Enter event location"
                    className="bg-gray-900 border-gray-700 focus:border-[#6c63ff] focus:ring-[#6c63ff] text-white"
                    onKeyDown={allowOnlyLetters}
                    onPaste={filterPastedLetters}
                  />
                  {errors.location && (
                    <p className="text-red-400 text-sm">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Type Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="eventType"
                    className="flex items-center text-white"
                  >
                    <Type size={18} className="mr-2 text-[#6c63ff]" />
                    Event Type
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("eventType", value)}
                    defaultValue={initialData?.eventType || ""}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700 focus:border-[#6c63ff] focus:ring-[#6c63ff] text-white">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {eventTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register("eventType")} />
                  {errors.eventType && (
                    <p className="text-red-400 text-sm">
                      {errors.eventType.message}
                    </p>
                  )}
                </div>

                {/* Duration Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="durationInDays"
                    className="flex items-center text-white"
                  >
                    <Clock size={18} className="mr-2 text-[#6c63ff]" />
                    Duration (in Days)
                  </Label>
                  <Input
                    {...register("durationInDays")}
                    id="durationInDays"
                    type="number"
                    min="1"
                    max="30"
                    placeholder="Enter event duration"
                    className="bg-gray-900 border-gray-700 focus:border-[#6c63ff] focus:ring-[#6c63ff] text-white"
                  />
                  {errors.durationInDays && (
                    <p className="text-red-400 text-sm">
                      {errors.durationInDays.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Budget Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="budget"
                    className="flex items-center text-white"
                  >
                    <DollarSign size={18} className="mr-2 text-[#6c63ff]" />
                    Budget
                  </Label>
                  <Input
                    {...register("budget", { valueAsNumber: true })}
                    id="budget"
                    type="number"
                    min="1"
                    max="10000000"
                    placeholder="Enter event budget"
                    className="bg-gray-900 border-gray-700 focus:border-[#6c63ff] focus:ring-[#6c63ff] text-white"
                  />
                  {errors.budget && (
                    <p className="text-red-400 text-sm">
                      {errors.budget.message}
                    </p>
                  )}
                </div>

                {/* Guest Limit Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="guestLimit"
                    className="flex items-center text-white"
                  >
                    <Users size={18} className="mr-2 text-[#6c63ff]" />
                    Guest Limit
                  </Label>
                  <Input
                    {...register("guestLimit", { valueAsNumber: true })}
                    id="guestLimit"
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="Enter guest limit"
                    className="bg-gray-900 border-gray-700 focus:border-[#6c63ff] focus:ring-[#6c63ff] text-white"
                  />
                  {errors.guestLimit && (
                    <p className="text-red-400 text-sm">
                      {errors.guestLimit.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Field */}
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center text-white">
                  <ImageIcon size={18} className="mr-2 text-[#6c63ff]" />
                  Event Image
                </Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      className="bg-gray-900 border-gray-700 focus:border-[#6c63ff] focus:ring-[#6c63ff] text-white file:text-white file:bg-gray-700 file:border-0 file:rounded file:px-4 file:py-2 file:mr-4 file:hover:bg-gray-600 file:cursor-pointer"
                      onChange={handleImageChange}
                    />
                  </div>
                  {imagePreview && (
                    <div className="h-20 w-20 rounded-md overflow-hidden border border-gray-700">
                      <Image
                        width={80}
                        height={80}
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="flex items-center text-white"
                >
                  <Type size={18} className="mr-2 text-[#6c63ff]" />
                  Description
                </Label>
                <Textarea
                  {...register("description")}
                  id="description"
                  placeholder="Enter event description"
                  className="bg-gray-900 border-gray-700 focus:border-[#6c63ff] focus:ring-[#6c63ff] text-white min-h-[120px]"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#6c63ff] hover:bg-[#5a52d4] text-white px-8 py-2 rounded-md transition-all transform hover:scale-105"
                >
                  {isLoading
                    ? "Submitting..."
                    : isEditing
                    ? "Update Event"
                    : "Create Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        .animation-delay-300 {
          animation-delay: 300ms;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EventForm;
