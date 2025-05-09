"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { uploadFile } from "@/store/rsvpSlice";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface GuestUploadProps {
  eventId: string;
  onSuccess: () => Promise<void>;
}

const GuestUpload = ({ eventId, onSuccess }: GuestUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validFileTypes = ["xlsx", "xls", "csv"];
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!validFileTypes.includes(fileExtension || "")) {
      toast.error("Only xlsx, xls, or csv files are allowed.");
      e.target.value = ""; // Clear the file input
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !eventId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);

    try {
      const result = await dispatch(uploadFile(formData)).unwrap();
      if (result) {
        await onSuccess(); // Call the refresh function from parent
        setFile(null);

        // Reset file input element
        const fileInput = document.getElementById(
          "guest-file-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      className="flex flex-col gap-2 max-w-xs sm:max-w-md"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs text-orange-400">
        * Upload your guest list as Excel or CSV file (with Name, Email)
      </p>
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-grow">
          <Input
            id="guest-file-upload"
            type="file"
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="text-sm w-full cursor-pointer"
            disabled={isUploading}
          />
        </div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            disabled={!file || isUploading}
            onClick={handleUpload}
            className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
          >
            <Upload className={`h-4 w-4 mr-1 ${isUploading ? "animate-spin" : ""}`} />
            <span>{isUploading ? "Uploading..." : "Upload"}</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GuestUpload;