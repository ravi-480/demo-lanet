import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "./store";
import { VendorType } from "@/Interface/interface";

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface VendorState {
  items: VendorType[];
  status: StatusType;
  error: string | { message: string } | null;
}

const initialState: VendorState = {
  items: [],
  status: "idle",
  error: null,
};

//  Create vendor
export const createVendor = createAsyncThunk<
  VendorType,
  VendorType,
  { rejectValue: { message: string } } // Change to object with message property
>("vendors/createVendor", async (vendorData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/vendors/add",
      vendorData
    );
    return response.data;
  } catch (error: any) {
    const errorMsg =
      typeof error.response?.data === "object" && error.response?.data.message
        ? error.response.data.message
        : error.response?.data || error.message;

    return rejectWithValue(errorMsg);
  }
});

// Get vendors by event
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

//  Delete vendor
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

// get vendor by user
export const getVendorByUser = createAsyncThunk<
  VendorType[],
  void,
  { rejectValue: string }
>("vendors/fetchByUser", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/vendors/getByUser",
      { withCredentials: true }
    );

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// remove added vendors from list
export const removeAddedVendor = createAsyncThunk(
  "vendor/removeVendor",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/vendors/remove-vendor/${id}`
      );
      return response.data;
    } catch (error: any) {
      rejectWithValue(error.response?.data || error.message);
    }
  }
);

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
      .addCase(getVendorByUser.pending, (state, action) => {
        (state.status = "loading"), (state.error = null);
      })
      .addCase(getVendorByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(getVendorByUser.rejected, (state, action) => {
        (state.status = "failed"),
          (state.error = action.payload || "Failed to fetch vendors by user");
      });
  },
});

export const { clearVendors } = vendorSlice.actions;
export const vendorByUser = (state: RootState) => state.vendors;
export default vendorSlice.reducer;
