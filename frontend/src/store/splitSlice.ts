import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import api from "@/utils/api";

interface Vendor {
  id: string;
  title: string;
  price: number;
}

interface User {
  name: string;
  email: string;
  _id?: string;
}

interface SplitState {
  eventId: string;
  splittedVendors: Vendor[];
  personInSplit: User[];
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

interface AddUserPayload {
  user: User; // Use User type for user data
  id: string;
}

export const addUserInSplit = createAsyncThunk<
  User,
  AddUserPayload,
  { rejectValue: string }
>(
  "addUser/addToSplit",
  async (userData: AddUserPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/vendors/addUserToSplit", userData);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to add user to split"
      );
    }
  }
);

export const deleteUserFromSplit = createAsyncThunk<
  string, // Return type
  { id: string; userId: string }, // Payload type
  { rejectValue: string }
>("split/deleteFromSplit", async (data, { rejectWithValue }) => {
  try {
    const response = await api.delete("/vendors/delete/addedInSplit", {
      data,
    });
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to delete user"
    );
  }
});

export const editUserInSplit = createAsyncThunk<
  User, // The returned data type from the API (User type)
  { user: User; id: string }, // Payload type
  { rejectValue: string }
>("split/editUserInSplit", async (data, { rejectWithValue }) => {
  try {
    const response = await api.patch("/vendors/split/users/edituser", data);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to edit user"
    );
  }
});

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

      // Add user to split
      .addCase(addUserInSplit.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addUserInSplit.fulfilled, (state, action) => {
        state.status = "success";
        state.personInSplit.push(action.payload); // Add user to split
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
      .addCase(deleteUserFromSplit.fulfilled, (state, action) => {
        state.status = "success";
        state.personInSplit = state.personInSplit.filter(
          (user) => user._id !== action.payload // Assuming the payload is the user ID
        );
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
      .addCase(editUserInSplit.fulfilled, (state, action) => {
        state.status = "success";
        const index = state.personInSplit.findIndex(
          (user) => user._id === action.payload._id
        );
        if (index !== -1) {
          state.personInSplit[index] = action.payload; // Update user info
        }
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
