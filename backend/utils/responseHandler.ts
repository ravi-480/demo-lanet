import { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};
