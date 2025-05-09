import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { EventState, IEvent, PaginatedResponse } from "@/Interface/interface";
import { AxiosError } from "axios";
import api from "@/utils/api";

const initialState: EventState = {
  events: [],
  singleEvent: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    limit: 8
  }
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

// Fetch all events with pagination
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params: { 
    page?: number; 
    limit?: number;
    tab?: string;  
    search?: string;
    date?: string;
    location?: string;
  } = {}, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.tab && params.tab !== 'all') queryParams.append('tab', params.tab); 
      if (params.search) queryParams.append('search', params.search);
      if (params.date) queryParams.append('date', params.date);
      if (params.location) queryParams.append('location', params.location);
      
      const queryString = queryParams.toString();
      const url = `/events${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError;

      if (err.response?.status === 401) {
        return rejectWithValue("Unauthorized");
      }

      return rejectWithValue(err.message || "Failed to fetch events");
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
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/events/updateEvent/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // without this file won't go in backend
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
  "event/adjustEventBudget",
  async (
    data: { eventId: string; adjustAmount: number },
    { rejectWithValue }
  ) => {
    try {
      // Updated to match backend route structure
      const response = await api.post(`/events/${data.eventId}/adjustBudget`, {
        adjustAmount: data.adjustAmount,
      });

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
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    }
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
        (state, action: PayloadAction<PaginatedResponse>) => {
          state.isLoading = false;
          state.events = action.payload.events || [];
          // Update pagination info
          state.pagination = {
            currentPage: action.payload.currentPage,
            totalPages: action.payload.totalPages,
            totalEvents: action.payload.totalEvents,
            limit: action.payload.limit
          };
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
          // Increment total count when event is created
          state.pagination.totalEvents += 1;
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
        // Decrement total count when event is deleted
        state.pagination.totalEvents = Math.max(0, state.pagination.totalEvents - 1);
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
      .addCase(adjustEventBudget.fulfilled, (state) => {
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

export const { clearEventErrors, resetEventState, setPage } = eventSlice.actions;

// Selectors
export const selectEvents = (state: RootState) => state.event.events || [];
export const selectEventLoading = (state: RootState) => state.event.isLoading;
export const selectEventError = (state: RootState) => state.event.error;
export const selectPagination = (state: RootState) => state.event.pagination;

// single event
export const singleEvent = (state: RootState) => state.event.singleEvent;

export default eventSlice.reducer;