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

export interface ISignupResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface User {
  user?: string;
}

export interface IEvent {
  name: string;
  date: Date;
  location: string;
  description: string;
  image: string | null;
  budget: {
    allocated: number;
    spent: number;
  };
  guestLimit: number;
  noOfGuestAdded: number;
  includedInSplit: {
    _id?: string;
    userId: string;
    status: string;
    name: string;
    email: string;
    joinedAt?: Date;
  }[];

  eventType: string;
  creator: string;

  createdAt?: Date;
  updatedAt?: Date;
}

import {Request} from "express"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}
