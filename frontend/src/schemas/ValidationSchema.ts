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
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords doesn't not match",
    path: ["confirmPassword"],
  });



export   const loginformSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
  });
  