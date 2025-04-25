import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "../utils/axiosConfig";

interface PaymentState {
  status: string;
  errorMessage: string;
}

const initialState: PaymentState = {
  status: "idle",
  errorMessage: "",
};

// fetch Payment Status
export const fetchPaymentStatus = createAsyncThunk(
  "payment/fetchStatus",
  async (
    { eventId, userId }: { eventId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.get("/vendors/payment-status", {
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

// update Payment method
export const confirmPayment = createAsyncThunk(
  "payment/confirmPayment",
  async (
    { eventId, userId }: { eventId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("/vendors/confirm-payment", {
        eventId,
        userId,
      });
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Error in payment"
        );
      }
      return rejectWithValue("Error in payment");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentStatus: (state) => {
      state.status = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
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
      })
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.status = "error";
        state.errorMessage = action.payload as string;
      })

      // confirm payment
      .addCase(confirmPayment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(confirmPayment.fulfilled, (state) => {
        state.status = "confirmed";
        state.errorMessage = "";
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.status = "error";
        state.errorMessage = action.payload as string;
      });
  },
});

export const { resetPaymentStatus } = paymentSlice.actions;

export default paymentSlice.reducer;
