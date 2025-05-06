"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import type {
  UseFormRegister,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  id: Path<T>;
  label: string;
  placeholder: string;
  type?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  showPassword?: boolean;
  toggleShowPassword?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
}

// Alert components
export const ErrorAlert = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return (
    <Alert
      variant="destructive"
      className="mb-4 bg-red-900/20 text-red-300 border border-red-800"
    >
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export const SuccessAlert = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return (
    <Alert className="mb-4 bg-green-900/20 border border-green-800">
      <AlertDescription className="text-green-300">{message}</AlertDescription>
    </Alert>
  );
};

// Form field components

export const FormField = <T extends FieldValues>({
  id,
  label,
  placeholder,
  type = "text",
  register,
  errors,
  showPassword,
  toggleShowPassword,
  onKeyDown,
  onPaste,
}: FormFieldProps<T>) => {
  const isPasswordField =
    type === "password" && toggleShowPassword !== undefined;

  return (
    <div className="space-y-1">
      <label htmlFor={id}>{label}</label>
      <div className="relative">
        <Input
          id={id}
          type={isPasswordField ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className={`bg-transparent border-gray-700 focus:border-[#6c63ff] transition-colors ${
            isPasswordField ? "pr-10 h-12" : ""
          }`}
          {...register(id)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
        />
        {isPasswordField && (
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
            onClick={toggleShowPassword}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        )}
      </div>
      {errors[id] && (
        <p className="text-sm text-red-500">{String(errors[id]?.message)}</p>
      )}
    </div>
  );
};

// Submit button component
interface SubmitButtonProps {
  isLoading: boolean;
  loadingText: string;
  buttonText: string;
}

export const SubmitButton = ({
  isLoading,
  loadingText,
  buttonText,
}: SubmitButtonProps) => (
  <Button
    type="submit"
    className="w-full bg-[#6c63ff] cursor-pointer hover:bg-[#5a52d4] text-white"
    disabled={isLoading}
  >
    {isLoading ? loadingText : buttonText}
  </Button>
);

// Form footer with link component
interface FormFooterProps {
  text: string;
  linkText: string;
  linkHref: string;
}

export const FormFooter = ({ text, linkText, linkHref }: FormFooterProps) => (
  <div className="flex justify-center mt-6">
    <p className="text-sm">
      {text}{" "}
      <Link href={linkHref}>
        <button className="text-[#6c63ff] hover:text-[#5a52d4] font-semibold">
          {linkText}
        </button>
      </Link>
    </p>
  </div>
);
