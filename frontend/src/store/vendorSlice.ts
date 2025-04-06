// src/store/vendorSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface VendorType {
  _id?: string;
  event: string;
  title: string;
  type: string;
  address: string;
  rating: number;
  reviews: number;
  description?: string;
  website?: string;
  directionsLink?: string;
  placeId: string;
  yearsInBusiness?: string;
  phone?: string;
  price: number;
  pricingUnit: string;
  category: string;
  numberOfGuests: number;
  addedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface VendorState {
  items: VendorType[];
  status: StatusType;
  error: string | null;
}

const initialState: VendorState = {
  items: [],
  status: "idle",
  error: null,
};

// ✅ Create vendor
export const createVendor = createAsyncThunk<
  VendorType,
  VendorType,
  { rejectValue: string }
>("vendors/createVendor", async (vendorData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/vendors/add",
      vendorData
    );
    return response.data as VendorType;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Get vendors by event
export const getVendorsByEvent = createAsyncThunk<
  VendorType[],
  string,
  { rejectValue: string }
>("vendors/getVendorsByEvent", async (eventId, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/vendors/event/${eventId}`
    );
    return response.data as VendorType[];
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Delete vendor
export const deleteVendor = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("vendors/deleteVendor", async (vendorId, { rejectWithValue }) => {
  try {
    await axios.delete(`http://localhost:5000/api/vendors/${vendorId}`);
    return vendorId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// ✅ Update vendor
export const updateVendor = createAsyncThunk<
  VendorType,
  { id: string; updatedData: Partial<VendorType> },
  { rejectValue: string }
>("vendors/updateVendor", async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      `http://localhost:5000/api/vendors/${id}`,
      updatedData
    );
    return response.data as VendorType;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
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
        state.error = action.payload || "Failed to create vendor";
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
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (vendor) => vendor._id !== action.payload
        );
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (v) => v._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { clearVendors } = vendorSlice.actions;
export default vendorSlice.reducer;
