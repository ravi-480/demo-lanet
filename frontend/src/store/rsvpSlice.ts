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
      });
  },
});

export const { setLoading } = rsvpSlice.actions;
export default rsvpSlice.reducer;
