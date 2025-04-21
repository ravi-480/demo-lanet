import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import axios from "axios";

interface SplitState {
  eventId: string;
  splittedVendors: any[];
  personInSplit: any[];
  status: "idle" | "loading" | "success" | "failed";
  error: string | null;
}

const initialState: SplitState = {
  eventId: "",
  splittedVendors: [],
  personInSplit: [],
  status: "idle",
  error: null,
};

export const addVendorInSplitOrRemove = createAsyncThunk<
  any, // returned data type from the API
  string, // payload type
  { rejectValue: string }
>("vendorSplit/addToSplit", async (vendorId, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/vendors/addToSplit",
      { vendorId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to add vendor to split"
    );
  }
});

interface AddUserPayload {
  user: { name: string; email: string };
  id: string;
}

export const addUserInSplit = createAsyncThunk(
  "addUser/addToSplit",
  async (userData: AddUserPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/vendors/addUserToSplit",
        userData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add user to split"
      );
    }
  }
);

// Remove added user in split
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
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

// Edit user details which were included in split
export const editUserInSplit = createAsyncThunk(
  "split/editUserInSplit",
  async (data: { user: any; id: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        "http://localhost:5000/api/vendors/split/users/edituser",
        data, // Send data directly, not wrapped in another object
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to edit user"
      );
    }
  }
);

const splitVendorPrice = createSlice({
  name: "split",
  initialState,
  reducers: {
    resetSplitStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to split vendors
      .addCase(addVendorInSplitOrRemove.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addVendorInSplitOrRemove.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(addVendorInSplitOrRemove.rejected, (state, action) => {
        state.status = "failed";
        console.log(action);

        state.error = (action.payload as string) || "Unknown error occurred";
      })

      // Add user to split
      .addCase(addUserInSplit.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addUserInSplit.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(addUserInSplit.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Unknown error occurred";
      })

      // Delete user from split
      .addCase(deleteUserFromSplit.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteUserFromSplit.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(deleteUserFromSplit.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Unknown error occurred";
      })

      // Edit user
      .addCase(editUserInSplit.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(editUserInSplit.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(editUserInSplit.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Unknown error occurred";
      });
  },
});

export const { resetSplitStatus } = splitVendorPrice.actions;
export const splitStatus = (state: RootState) => state.splitPrice.status;
export const splitError = (state: RootState) => state.splitPrice.error;
export const splittedVendors = (state: RootState) =>
  state.splitPrice.splittedVendors;
export const peopleInSplit = (state: RootState) =>
  state.splitPrice.personInSplit;

export default splitVendorPrice.reducer;
