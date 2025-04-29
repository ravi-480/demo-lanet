import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../utils/axiosConfig";
import api from "@/utils/api";

interface PaymentState {
  status: string;
  errorMessage: string;
  amount: number | null;
  currency: string;
  orderId: string | null;
  paymentDetails: {
    paymentId: string;
    timestamp: string;
  } | null;
  userDetails: {
    name: string;
    status: string;
    amount: number;
  } | null;
}

const initialState: PaymentState = {
  status: "idle",
  errorMessage: "",
  amount: null,
  currency: "INR",
  orderId: null,
  paymentDetails: null,
  userDetails: null,
};

// fetch Payment Status and user details
export const fetchPaymentStatus = createAsyncThunk(
  "payment/fetchStatus",
  async (
    { eventId, userId }: { eventId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get("/payment/verify-status", {
        params: { eventId, userId },
      });
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || "Error while fetching payment Status"
        );
      }
      return rejectWithValue("Error while fetching payment Status");
    }
  }
);

// Initialize payment (creates order in Razorpay)
export const initializePayment = createAsyncThunk(
  "payment/initialize",
  async (
    {
      eventId,
      userId,
      amount,
    }: {
      eventId: string;
      userId: string;
      amount: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/payment/create-order", {
        eventId,
        userId,
        amount,
      });
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || "Error initializing payment"
        );
      }
      return rejectWithValue("Error initializing payment");
    }
  }
);

// Verify payment after Razorpay callback
export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async (
    {
      paymentId,
      orderId,
      signature,
      eventId,
      userId,
    }: {
      paymentId: string;
      orderId: string;
      signature: string;
      eventId: string;
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/payment/verify-payment", {
        paymentId,
        orderId,
        signature,
        eventId,
        userId,
      });
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || "Payment verification failed"
        );
      }
      return rejectWithValue("Payment verification failed");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentStatus: (state) => {
      state.status = "idle";
      state.errorMessage = "";
    },
    setLoading: (state) => {
      state.status = "loading";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment status
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        if (action.payload.status === "Paid") {
          state.status = "Paid";
        } else {
          state.status = "idle";
        }
        state.errorMessage = "";
        state.amount = action.payload.amount || null;
        state.userDetails = action.payload.userDetails || null;
      })
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.status = "error";
        state.errorMessage = action.payload as string;
      })

      // Initialize payment
      .addCase(initializePayment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.orderId = action.payload.id;
        state.amount = action.payload.amount / 100; // Razorpay returns amount in paisa
        state.status = "initialized";
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.status = "error";
        state.errorMessage = action.payload as string;
      })

      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.status = "confirmed";
        state.paymentDetails = {
          paymentId: action.payload.paymentId,
          timestamp: action.payload.timestamp,
        };
        state.errorMessage = "";
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.status = "error";
        state.errorMessage = action.payload as string;
      });
  },
});

export const { resetPaymentStatus } = paymentSlice.actions;

export default paymentSlice.reducer;
