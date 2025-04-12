import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import axios from "axios";

const initialState = {
  eventId: "",
  splittedVendors: [],
  personInSplit: [],
  status: "idle",
};

export const addToSplitVendors = createAsyncThunk(
  "vendorSplit/addToSplit",
  async (vendorData: {}, { rejectWithValue }) => {
    console.log(vendorData);

    const response = axios.post(
      "http://localhost:5000/api/vendors/addToSplit",
      vendorData,
      { withCredentials: true }
    );

    console.log(response);
  }
);
interface AddUserPayload {
  user: { name: string; email: string };
  id: string;
}

export const addUserInSplit = createAsyncThunk(
  "addUser/addToSplit",
  async (userData: AddUserPayload, { rejectWithValue }) => {
    const response = await axios.post(
      "http://localhost:5000/api/vendors/addUserToSplit",
      userData,
      { withCredentials: true }
    );
  }
);

// remove added user in split

export const deleteUserFromSplit = createAsyncThunk(
  "split/deleteFromSplit",
  async (data: { id: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        "http://localhost:5000/api/vendors/delete/addedInSplit",
        { data, withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete User"
      );
    }
  }
);

const splitVendorPrice = createSlice({
  name: "split",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToSplitVendors.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addToSplitVendors.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(addToSplitVendors.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const {} = splitVendorPrice.actions;
export const spliitedVendors = (state: RootState) => state.splitPrice;
export default splitVendorPrice.reducer;
