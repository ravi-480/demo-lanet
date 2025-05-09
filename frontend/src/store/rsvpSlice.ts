import { Guest } from "@/Interface/interface";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/utils/api";

interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}
interface GuestResponse {
  guests: Guest[];
  totalCount: number;
  guestStats: GuestStats;
}

interface RSVPState {
  rsvpData: Guest[];
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: null | string;
  totalCount: number;
  guestStats: GuestStats | null;
}

const initialState: RSVPState = {
  rsvpData: [],
  status: "idle",
  loading: false,
  error: null,
  totalCount: 0,
  guestStats: null,
};

export const uploadFile = createAsyncThunk(
  "rsvp/uploadRsvp",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/guest/upload-guest-excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.message;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to upload file"
        );
      }
      return rejectWithValue("Failed to upload file");
    }
  }
);

// Fetch guests with pagination and filtering
export const fetchGuests = createAsyncThunk<
  GuestResponse,
  { id: string; status: string; search: string; page: number; limit: number }
>(
  "rsvp/fetchGuests",
  async (
    params: {
      id: string;
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const { id: eventId, search, status, page = 1, limit = 10 } = params;

      // Build query string for backend filtering and pagination
      let url = `/guest/${eventId}`;
      const queryParams = [];

      if (search) {
        queryParams.push(`search=${encodeURIComponent(search)}`);
      }

      if (status && status !== "all") {
        queryParams.push(`status=${encodeURIComponent(status)}`);
      }

      // Add pagination parameters
      queryParams.push(`page=${page}`);
      queryParams.push(`limit=${limit}`);

      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const response = await api.get(url);

      // Return both the guest list and the total count
      return {
        guests: response.data.rsvpList || [],
        totalCount:
          response.data.totalCount || response.data.rsvpList?.length || 0,
        guestStats: {
          confirmed: response.data.confirmed || 0,
          pending: response.data.pending || 0,
          declined: response.data.declined || 0,
          total:
            response.data.totalCount || response.data.rsvpList?.length || 0,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// fetch guest guestStats

export const fetchGuestStats = createAsyncThunk<GuestStats, string>(
  "rsvp/fetchGuestStats",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/guest/${eventId}?onlyStats=true`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// remove all guest
export const removeAllGuest = createAsyncThunk(
  "rsvp/remove-guest",
  async (data: { id: string; query: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/guest/removeAllGuestOrVendor`, {
        data,
      });
      // Return the full response data which may include preservedVendors
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // If the response includes violatingVendors, pass that along
        if (error.response?.data?.violatingVendors) {
          return rejectWithValue({
            message: error.response?.data.message,
            violatingVendors: error.response?.data.violatingVendors,
          });
        }
        return rejectWithValue(
          error.response?.data?.message || "Failed to remove guests"
        );
      }
      return rejectWithValue("Failed to remove guests");
    }
  }
);

export const addSingleGuest = createAsyncThunk(
  "guest/add",
  async (guestData: Guest, { rejectWithValue }) => {
    try {
      const response = await api.post("/guest/addSingleGuest", guestData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to add guest"
        );
      }
      return rejectWithValue("Failed to add guest");
    }
  }
);

// remove single guest
export const removeSingleGuest = createAsyncThunk(
  "rsvp/removeSingleGuest",
  async (guestId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete("/guest/removeSingleGuest", {
        params: { guestId },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // If the error includes violatingVendors, pass that along
        if (error.response?.data?.violatingVendors) {
          return rejectWithValue({
            message: error.response?.data.message,
            violatingVendors: error.response?.data.violatingVendors,
          });
        }
        return rejectWithValue(
          error.response?.data?.message || "Failed to remove guest"
        );
      }
      return rejectWithValue("Failed to remove guest");
    }
  }
);

// edit user details
export const updateSingleGuest = createAsyncThunk(
  "rsvp/updateSingleGuest",
  async (
    {
      eventId,
      guestId,
      data,
    }: { eventId: string; guestId: string; data: Record<string, unknown> },
    thunkAPI
  ) => {
    try {
      const response = await api.put(`/guest/${eventId}/${guestId}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || "Failed to update guest"
        );
      }
      return thunkAPI.rejectWithValue("Failed to update guest");
    }
  }
);

// send invite to all
export const sendInviteAll = createAsyncThunk(
  "rsvp/sendInviteAll",
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await api.post("/guest/inviteAll", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to send mail to all"
        );
      }
      return rejectWithValue("Failed to send mail to all");
    }
  }
);

// send reminder to pending guest
export const sendReminder = createAsyncThunk(
  "rsvp/sendReminder",
  async (data: { eventId: string; guestId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/guest/sendReminder", data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to send reminder mail"
        );
      }
      return rejectWithValue("Failed to send reminder mail");
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
    resetGuestList: (state) => {
      state.rsvpData = [];
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchGuests.fulfilled,
        (state, action: PayloadAction<GuestResponse>) => {
          console.log(action);

          state.rsvpData = action.payload.guests;
          state.totalCount = action.payload.totalCount;
          state.guestStats = action.payload.guestStats;
          state.status = "succeeded";
          state.loading = false;
        }
      )
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.status = "failed";
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
        // Don't modify state here - let the component refresh the data
        // to get accurate pagination information from the server
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
        // Don't modify the state here - let the component refresh via fetchGuests
        // to get accurate pagination information from the server
      })
      .addCase(removeSingleGuest.rejected, (state, action) => {
        state.loading = false;
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
      .addCase(removeAllGuest.fulfilled, (state) => {
        state.loading = false;
        state.rsvpData = []; // clear guest list on success
        state.totalCount = 0; // reset total count
      })
      .addCase(removeAllGuest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to remove all guests";
      })
      .addCase(fetchGuestStats.fulfilled, (state, action) => {
        state.guestStats = action.payload;
      });
  },
});

export const { setLoading, resetGuestList } = rsvpSlice.actions;
export default rsvpSlice.reducer;
