import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { IEvent } from "@/Interface/interface";
import { AxiosError } from "axios";
import api from "@/utils/api";

interface EventState {
  events: IEvent[];
  isLoading: boolean;
  singleEvent: IEvent | null;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  singleEvent: null,
  isLoading: false,
  error: null,
};

// creating new events
export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/events/create-new-event", eventData);

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            "Failed to store event"
        );
      }
      return rejectWithValue("Failed to store event");
    }
  }
);

// Fetch all events
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/events");
      return response.data.events;
    } catch (error: any) {

      if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized");
      }
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

// fetch Event by Id

export const fetchById = createAsyncThunk(
  "events/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${id}`);

      return response.data.event;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch events"
        );
      }
      return rejectWithValue("Failed to fetch events");
    }
  }
);

// update Event

export const updateEvent = createAsyncThunk(
  "event/updateEvent",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await api.put(`/events/updateEvent`, data, {
        headers: {
          "Content-Type": "multipart/form-data", // without this file wont go in backend
        },
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update event"
        );
      }
      return rejectWithValue("Failed to update event");
    }
  }
);

// Delete Event

export const deleteEvent = createAsyncThunk(
  "event/deleteEvent",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/events/deleteEvent/${id}`);

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete Event"
        );
      }
      return rejectWithValue("Failed to delete Event");
    }
  }
);

// update event budget

export const adjustEventBudget = createAsyncThunk(
  "event/adjustEvent",
  async (
    data: { eventId: string; adjustAmount: number },
    { rejectWithValue }
  ) => {
    console.log(data);

    try {
      const response = await api.post(`/events/adjustBudget`, { data });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to adjust Event Budget"
        );
      }
      return rejectWithValue("Failed to adjust Event Budget");
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
      state.singleEvent = null;
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

      // create event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createEvent.fulfilled,
        (state, action: PayloadAction<IEvent>) => {
          state.isLoading = false;
          state.events.unshift(action.payload);
        }
      )
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to create event";
      })

      // fetch single event
      .addCase(fetchById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchById.fulfilled, (state, action: PayloadAction<IEvent>) => {
        state.isLoading = false;
        state.singleEvent = action.payload;
      })
      .addCase(fetchById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload == "string"
            ? action.payload
            : "Failed to fetch event by Id";
      })

      // update event
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload == "string"
            ? action.payload
            : "Failed to fetch event by id";
      })

      // delete event
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload == "string"
            ? action.payload
            : "Failed to delete Event";
      })
      .addCase(adjustEventBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adjustEventBudget.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(adjustEventBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to adjust event budget";
      });
  },
});

export const { clearEventErrors, resetEventState } = eventSlice.actions;

// Selectors
export const selectEvents = (state: RootState) => state.event.events || [];
export const selectEventLoading = (state: RootState) => state.event.isLoading;
export const selectEventError = (state: RootState) => state.event.error;

// single event
export const singleEvent = (state: RootState) => state.event.singleEvent;

export default eventSlice.reducer;
