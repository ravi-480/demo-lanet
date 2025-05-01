import * as z from "zod";

export const signupformSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters." })
      .max(100, { message: "Name length cannot be more than 100 character" }),
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .trim()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "password should be mixture of one uppercase, lowecase, number & special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords doesn't not match",
    path: ["confirmPassword"],
  });

export const loginformSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});


// create event form schema 

export const eventFormSchema = z.object({
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