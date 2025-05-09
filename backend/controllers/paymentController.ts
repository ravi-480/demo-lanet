import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import paymentService from "../services/paymentService";
import {
  CheckPaymentQuery,
  CreateOrderBody,
  VerifyPaymentBody,
} from "../Interfaces/payment.interface";

export const checkPaymentStatus = asyncHandler(
  async (req: Request<{}, {}, {}, CheckPaymentQuery>, res: Response) => {
    const result = await paymentService.checkPaymentStatus(req.query);
    return res.status(200).json(result);
  }
);

export const createOrder = asyncHandler(
  async (req: Request<{}, {}, CreateOrderBody>, res: Response) => {
    const result = await paymentService.createOrder(req.body);
    return res.status(201).json(result);
  }
);

export const verifyPayment = asyncHandler(
  async (req: Request<{}, {}, VerifyPaymentBody>, res: Response) => {
    const result = await paymentService.verifyPayment(req.body);
    return res.status(200).json(result);
  }
);
