import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "./store";
import Cookies from "js-cookie";
import { IEvent } from "@/Interface/interface";

interface EventState {
  events: IEvent[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  isLoading: false,
  error: null,
};

export const storeEvent = createAsyncThunk(
  "events/storeEvent",
  async (eventData: FormData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      let token: string | null =
        state.auth.token || Cookies.get("token") || null;

      if (!token) {
        return rejectWithValue("User not authenticated - no token available");
      }

      const response = await axios.post(
        "http://localhost:5000/api/events",
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to store event"
      );
    }
  }
);

// Fetch all events
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:5000/api/events", {
        withCredentials: true,
      });
      return response.data.events;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch events"
      );
    }
  }
);

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    clearEventErrors: (state) => {
      state.error = null;
    },
    resetEventState: (state) => {
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchEvents.fulfilled,
        (state, action: PayloadAction<IEvent[]>) => {
          state.isLoading = false;
          state.events = action.payload || [];
        }
      )
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload == "string"
            ? action.payload
            : "Failed to fetch events";
      })

      // Store event
      .addCase(storeEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(storeEvent.fulfilled, (state, action: PayloadAction<IEvent>) => {
        state.isLoading = false;
        state.events.unshift(action.payload);
      })
      .addCase(storeEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to create event";
      });
  },
});

export const { clearEventErrors, resetEventState } = eventSlice.actions;

// Selectors
export const selectEvents = (state: RootState) => state.event.events || [];
export const selectEventLoading = (state: RootState) => state.event.isLoading;
export const selectEventError = (state: RootState) => state.event.error;

export default eventSlice.reducer;
