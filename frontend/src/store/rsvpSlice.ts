import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Guest {
  _id: string;
  name: string;
  email: string;
  status: string;
  eventId: string;
}

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
      return response.data.message; // return useful message or data
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
      return response.data.rsvpList; // ensure your backend returns rsvpList
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch guest list"
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
        data, // Fixed: send only the data
        {
          withCredentials: true, // Fixed: moved to the config object
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
      console.log(eventId, guestId, data);

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
      // FETCH GUESTS
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

      // UPLOAD FILE
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

      // handle single user uploading
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
        state.error = (action.payload as string) || "Failed to add Guest";
      })

      // remove single guest
      .addCase(removeSingleGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSingleGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.rsvpData = state.rsvpData.filter(
          (guest) => guest._id !== action.payload.guestId
        );
      })
      .addCase(removeSingleGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to remove guest";
      })

      // edit guest details
      .addCase(updateSingleGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSingleGuest.fulfilled, (state, action) => {
        state.loading = false;
        // Properly handle the response structure
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
      });
  },
});

export const { setLoading } = rsvpSlice.actions;
export default rsvpSlice.reducer;
