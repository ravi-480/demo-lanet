"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchGuests, uploadFile } from "@/store/rsvpSlice";
import { toast } from "sonner";

interface GuestUploadProps {
  eventId: string;
}

const GuestUpload = ({ eventId }: GuestUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validImageTypes = [".xlsx, .xls, .csv"];
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!validImageTypes.includes(selectedFile.type)) {
      alert("Only xlsx, xls, or csv files are allowed.");
      e.target.value = "";
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !eventId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);

    try {
      const result = await dispatch(uploadFile(formData));
      if (uploadFile.fulfilled.match(result)) {
        toast.success("Guest file uploaded successfully");
        dispatch(fetchGuests(eventId)); // refreshing
        setFile(null); // Reset file input

        // Reset file input element
        const fileInput = document.getElementById(
          "guest-file-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error("Upload failed: " + result.payload);
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 max-w-xs sm:max-w-md">
      <div className="relative flex-grow">
        <Input
          id="guest-file-upload"
          type="file"
          onChange={handleFileChange}
          accept=".xlsx, .xls, .csv"
          className="text-sm"
        />
      </div>
      <Button
        size="sm"
        disabled={!file}
        onClick={handleUpload}
        className="whitespace-nowrap"
      >
        <Upload className="h-4 w-4 mr-1" />
        <span>Upload</span>
      </Button>
    </div>
  );
};

export default GuestUpload;
