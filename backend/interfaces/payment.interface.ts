// Type for query parameters in checkPaymentStatus
export interface CheckPaymentQuery {
  eventId?: string;
  userId?: string;
}

// Type for order creation request body
export interface CreateOrderBody {
  eventId: string;
  userId: string;
  amount?: number;
}

// Type for payment verification request body
export interface VerifyPaymentBody {
  paymentId: string;
  orderId: string;
  signature: string;
  eventId: string;
  userId: string;
}

// Type for user included in split
export interface UserInSplit {
  _id?: string;
  status: "pending" | "Paid" | "declined";
  name?: string;
  email?: string;
  amount?: number;
  joinedAt: Date;
  paymentId?: string | null;
  paymentTimestamp?: Date | null;
}

// Response types
export interface CheckPaymentResponse {
  success: boolean;
  status: string;
  amount: number;
  userDetails: {
    name: string;
    email: string;
    status: string;
    amount: number;
    joinedAt: Date;
  };
}

export interface CreateOrderResponse {
  success: boolean;
  id: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  paymentId: string;
  timestamp: string;
}

// Razorpay Order interface
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  notes: Record<string, any>;
  created_at: number;
}
