"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
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
      } else {
        toast.error("Upload failed: " + result.payload);
      }
    } catch (error) {
      toast.error("An error occurred during upload");
      console.error(error);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="file"
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv"
        className="max-w-64"
      />
      <Button disabled={!file} onClick={handleUpload}>
        Upload
      </Button>
    </div>
  );
};

export default GuestUpload;
