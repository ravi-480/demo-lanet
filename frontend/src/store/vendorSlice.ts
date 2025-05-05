import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import {
  ManualVendorExpenseData,
  PaginationMeta,
  SendMailRequest,
  VendorState,
  VendorType,
} from "@/Interface/interface";
import { AxiosError } from "axios";
import api from "@/utils/api";


// Updated initial state with pagination
const initialState: VendorState = {
  items: [],
  pagination: null,
  status: "idle",
  error: null,
};

// Create vendor
export const createVendor = createAsyncThunk<
  VendorType,
  VendorType,
  { rejectValue: { message: string } }
>("vendors/createVendor", async (vendorId, { rejectWithValue }) => {
  try {
    const response = await api.post("/vendors/add", vendorId);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const errorMsg =
        error.response?.data?.message || error.response?.data || error.message;
      return rejectWithValue({ message: errorMsg });
    }
    return rejectWithValue({ message: "An unknown error occurred" });
  }
});

// Get vendors by event
export const getVendorsByEvent = createAsyncThunk<
  VendorType[],
  { eventId: string; includeSplit: boolean },
  { rejectValue: string }
>(
  "vendors/getVendorsByEvent",
  async ({ eventId, includeSplit }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/vendors/event/${eventId}`, {
        params: {
          includeSplit: includeSplit ? "true" : undefined,
        },
      });
      return response.data as VendorType[];
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue("Failed to fetch vendors");
    }
  }
);

// Updated getVendorByUser to support pagination
export const getVendorByUser = createAsyncThunk<
  { vendors: VendorType[]; pagination: PaginationMeta },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("vendors/fetchByUser", async (params = {}, { rejectWithValue }) => {
  const { page = 1, limit = 5 } = params as { page?: number; limit?: number };

  try {
    const response = await api.get("/vendors/getByUser", {
      params: { page, limit },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || error.message || error);
    }
    return rejectWithValue("Failed to fetch vendors by user");
  }
});

// Remove added vendors from list
export const removeAddedVendor = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("vendor/removeVendor", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/vendors/remove-vendor/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || error.message);
    }
    return rejectWithValue("Failed to remove vendor");
  }
});

// Add manual vendor expense
export const addManualVendorExpense = createAsyncThunk<
  void,
  ManualVendorExpenseData,
  { rejectValue: string }
>("vendor/addOtherExpense", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/vendors/addManualExpense", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || error.message);
    }
    return rejectWithValue("Failed to add manual expense");
  }
});

// Send mail to vendor - Updated to handle both mail and negotiation
export const sendMailToVendor = createAsyncThunk<
  void,
  SendMailRequest,
  { rejectValue: string }
>("vendor/sendMail", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/vendors/send-mail-toVendor", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || error.message);
    }
    return rejectWithValue("Failed to contact vendor");
  }
});

// Remove all vendors
export const removeAllVendor = createAsyncThunk<
  void,
  { id: string; query: string },
  { rejectValue: string }
>("vendor/removeAllVendor", async (data, { rejectWithValue }) => {
  try {
    const response = await api.delete("/guest/removeAllGuestOrVendor", {
      data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || error.message);
    }
    return rejectWithValue("Failed to remove all vendors");
  }
});

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearVendors: (state) => {
      state.items = [];
      state.pagination = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVendor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.push(action.payload);
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to create vendor";
      })
      .addCase(getVendorsByEvent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVendorsByEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(getVendorsByEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch vendors";
      })
      .addCase(getVendorByUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getVendorByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.vendors;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getVendorByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch vendors by user";
      })
      .addCase(removeAllVendor.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeAllVendor.fulfilled, (state) => {
        state.status = "succeeded";
        state.items = []; // Clear the vendor list
        state.pagination = null; // Reset pagination
      })
      .addCase(removeAllVendor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove all vendors";
      })
      // Updated cases for sendMailToVendor (now handles both mail and negotiation)
      .addCase(sendMailToVendor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendMailToVendor.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(sendMailToVendor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to contact vendor";
      });
  },
});

export const { clearVendors } = vendorSlice.actions;
export const vendorByUser = (state: RootState) => state.vendors;
export default vendorSlice.reducer;
