import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../utils/axiosConfig";
import { RootState } from "./store";
import { VendorType } from "@/Interface/interface";
import { AxiosError } from "axios"; // Import AxiosError for better error typing

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface VendorState {
  items: VendorType[];
  status: StatusType;
  error: string | { message: string } | null;
}

interface ManualVendorExpenseData {
  eventId: string;
  title: string;
  price: number;
  description?: string;
  [key: string]: string | number | undefined; // For any additional properties
}

const initialState: VendorState = {
  items: [],
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
    const response = await axios.post("/vendors/add", vendorId);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      // Handle Axios error and access response correctly
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
      const response = await axios.get(`/vendors/event/${eventId}`, {
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

// Get vendor by user account
export const getVendorByUser = createAsyncThunk<
  VendorType[],
  void,
  { rejectValue: string }
>("vendors/fetchByUser", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/vendors/getByUser", {
      withCredentials: true,
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
    const response = await axios.delete(`/vendors/remove-vendor/${id}`);
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
    const response = await axios.post("/vendors/addManualExpense", data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || error.message);
    }
    return rejectWithValue("Failed to add manual expense");
  }
});

// Remove all vendors
export const removeAllVendor = createAsyncThunk<
  void,
  { id: string; query: string },
  { rejectValue: string }
>("vendor/removeAllVendor", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.delete("/guest/removeAllGuestOrVendor", {
      data,
      withCredentials: true,
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
        state.items = action.payload;
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
      })
      .addCase(removeAllVendor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove all vendors";
      });
  },
});

export const { clearVendors } = vendorSlice.actions;
export const vendorByUser = (state: RootState) => state.vendors;
export default vendorSlice.reducer;
