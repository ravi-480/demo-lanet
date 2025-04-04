import mongoose from "mongoose";

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ISignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface User {
  user?: string;
}

// File: /Interface/interface.ts

export interface IEvent {
  name: string;
  date: Date;
  time?: string;
  location: string;
  description: string;
  status: "upcoming" | "completed" | "draft";
  image: string | null;
  budget: {
    allocated: number;
    spent: number;
  };
  guestLimit: number;
  rsvp: {
    total: number;
    confirmed: number;
  };
  creator: string;
  attendees: Array<{
    userId: string;
    status: "pending" | "confirmed" | "declined";
    responseDate: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}
