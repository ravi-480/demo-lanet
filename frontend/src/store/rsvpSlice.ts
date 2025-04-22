import { Guest } from "@/Interface/interface";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface RSVPState {
  rsvpData: Guest[];
  loading: boolean;
  error: null | string;
}

const initialState: RSVPState = {
  rsvpData: [],
  loading: false,
  error: null,
};

// Upload guest file
export const uploadFile = createAsyncThunk(
  "rsvp/uploadRsvp",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/guest/upload-guest-excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload file"
      );
    }
  }
);

// Fetch added guests
export const fetchGuests = createAsyncThunk(
  "rsvp/fetchGuest",
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/guest/${eventId}`,
        {
          withCredentials: true,
        }
      );
      return response.data.rsvpList;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch guest list"
      );
    }
  }
);

// remove all guest
export const removeAllGuest = createAsyncThunk(
  "rsvp/remove-guest",
  async (data: { id: string; query: string }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/guest/removeAllGuestOrVendor`,
        { data, withCredentials: true }
      );
      // Return the full response data which may include preservedVendors
      return response.data;
    } catch (error: any) {
      // If the response includes violatingVendors, pass that along
      if (error.response?.data?.violatingVendors) {
        return rejectWithValue({
          message: error.response.data.message,
          violatingVendors: error.response.data.violatingVendors,
        });
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove guests"
      );
    }
  }
);

// add guest manually
export const addSingleGuest = createAsyncThunk(
  "rsvp/addSingleGuest",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/guest/addSingleGuest",
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add user details"
      );
    }
  }
);

// remove single guest
export const removeSingleGuest = createAsyncThunk(
  "rsvp/removeSingleGuest",
  async (guestId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        "http://localhost:5000/api/guest/removeSingleGuest",
        {
          params: { guestId },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      // If the error includes violatingVendors, pass that along
      if (error.response?.data?.violatingVendors) {
        return rejectWithValue({
          message: error.response.data.message,
          violatingVendors: error.response.data.violatingVendors,
        });
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove guest"
      );
    }
  }
);

// edit user details
export const updateSingleGuest = createAsyncThunk(
  "rsvp/updateSingleGuest",
  async (
    { eventId, guestId, data }: { eventId: string; guestId: string; data: any },
    thunkAPI
  ) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/guest/${eventId}/${guestId}`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update guest"
      );
    }
  }
);

// send invite to all
export const sendInviteAll = createAsyncThunk(
  "rsvp/sendInviteAll",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/guest/inviteAll",
        data,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send mail to all"
      );
    }
  }
);

// send reminder to pending guest
export const sendReminder = createAsyncThunk(
  "rsvp/sendReminder",
  async (data: { eventId: string; guestId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/guest/sendReminder",
        data,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reminder mail"
      );
    }
  }
);

const rsvpSlice = createSlice({
  name: "rsvp",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGuests.fulfilled,
        (state, action: PayloadAction<Guest[]>) => {
          state.rsvpData = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addSingleGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSingleGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.rsvpData.push(action.payload);
      })
      .addCase(addSingleGuest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to add Guest";
      })

      .addCase(removeSingleGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSingleGuest.fulfilled, (state, action) => {
        state.loading = false;
        // If the backend returns a guestId, use it
        if (action.payload.guestId) {
          state.rsvpData = state.rsvpData.filter(
            (guest) => guest._id !== action.payload.guestId
          );
        }
        // We'll let the component handle refreshing the list with fetchGuests instead
      })
      .addCase(removeSingleGuest.rejected, (state, action) => {
        state.loading = false;
        // Handle complex error objects or string errors
        state.error = (action.payload as string) || "Failed to remove guest";
      })

      .addCase(updateSingleGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSingleGuest.fulfilled, (state, action) => {
        state.loading = false;
        const updatedGuest = action.payload.guest || action.payload;
        const index = state.rsvpData.findIndex(
          (guest) => guest._id === updatedGuest._id
        );
        if (index !== -1) {
          state.rsvpData[index] = updatedGuest;
        }
      })
      .addCase(updateSingleGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(sendInviteAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendInviteAll.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendInviteAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // send reminder
      .addCase(sendReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendReminder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // remove all guests
      .addCase(removeAllGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAllGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.rsvpData = []; // clear guest list on success
      })
      .addCase(removeAllGuest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to remove all guests";
      });
  },
});

export const { setLoading } = rsvpSlice.actions;
export default rsvpSlice.reducer;
