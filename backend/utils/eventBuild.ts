import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

export const buildEventData = (
  body: any,
  image: string | undefined,
  userId?: string
) => {
  const {
    name,
    date,
    location,
    description,
    budget,
    guestLimit,
    eventType,
    durationInDays,
  } = body;

  return {
    name,
    date: new Date(date),
    location,
    description,
    image,
    eventType,
    durationInDays: Number(durationInDays) || 1,
    guestLimit: Number(guestLimit) || 0,
    budget: {
      allocated: Number(budget) || 0,
      spent: 0,
    },
    rsvp: {
      total: Number(guestLimit) || 0,
      confirmed: 0,
    },
    ...(userId && {
      creator: new mongoose.Types.ObjectId(userId),
      status: "upcoming",
      attendees: [],
    }),
  };
};

export const uploadImageToCloudinary = async (
  file: Express.Multer.File
): Promise<string> => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: "events",
    resource_type: "image",
  });

  return result.secure_url;
};
