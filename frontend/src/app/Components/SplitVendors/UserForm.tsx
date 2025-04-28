"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SplitUser } from "@/Interface/interface";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface UserFormProps {
  register: UseFormRegister<SplitUser>;
  errors: FieldErrors<SplitUser>;
  isLoading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

export const UserForm = ({
  register,
  errors,
  isLoading,
  onSubmit,
  onCancel,
  submitLabel,
}: UserFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4 py-2">
    <div className="space-y-1">
      <Label htmlFor="name" className="text-sm font-medium">
        Name
      </Label>
      <Input
        id="name"
        placeholder="Enter full name"
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
        className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
        {...register("name", { required: "Name is required" })}
      />
      {errors.name && (
        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
      )}
    </div>

    <div className="space-y-1">
      <Label htmlFor="email" className="text-sm font-medium">
        Email
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="email@example.com"
        className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "Invalid email format",
          },
        })}
      />
      {errors.email && (
        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
      )}
    </div>

    <DialogFooter className="pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="bg-cyan-600 hover:bg-cyan-700 ml-2"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : submitLabel}
      </Button>
    </DialogFooter>
  </form>
);
