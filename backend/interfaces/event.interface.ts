import { Request } from "express";
import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  id: string;
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface IBudget {
  allocated: number;
  spent: number;
}

export interface ISplitParticipant {
  _id?: string;
  status: "pending" | "Paid" | "declined";
  name: string;
  email: string;
  amount: number;
  joinedAt: Date;
  paymentId: string | null;
  paymentTimestamp: Date | null;
}

export interface IEvent {
  name: string;
  date: Date;
  location: string;
  description: string;
  image: string | null;
  budget: IBudget;
  guestLimit: number;
  noOfGuestAdded: number;
  includedInSplit: ISplitParticipant[];
  creator: Types.ObjectId;
  eventType: string;
  durationInDays: number;
}
