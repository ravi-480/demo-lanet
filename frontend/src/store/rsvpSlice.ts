import { Guest } from "@/Interface/interface";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/utils/api";

interface RSVPState {
  rsvpData: Guest[];
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: null | string;
}

const initialState: RSVPState = {
  rsvpData: [],
  status: "idle",
  loading: false,
  error: null,
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

// Fetch added guests
export const fetchGuests = createAsyncThunk(
  "rsvp/fetchGuests",
  async (
    params: { id: string; search?: string; status?: string } | string,
    { rejectWithValue }
  ) => {
    try {
      // Handle both object and string formats to maintain backward compatibility
      let eventId: string;
      let search: string | undefined;
      let status: string | undefined;

      if (typeof params === "string") {
        eventId = params;
      } else {
        eventId = params.id;
        search = params.search;
        status = params.status;
      }

      // Build query string for backend filtering
      let url = `/guest/${eventId}`;
      const queryParams = [];

      if (search) {
        queryParams.push(`search=${encodeURIComponent(search)}`);
      }

      if (status && status !== "all") {
        queryParams.push(`status=${encodeURIComponent(status)}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const response = await api.get(url);
      return response.data.rsvpList;
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
            message: error.response.data.message,
            violatingVendors: error.response.data.violatingVendors,
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
            message: error.response.data.message,
            violatingVendors: error.response.data.violatingVendors,
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
        (state, action: PayloadAction<Guest[]>) => {
          state.rsvpData = action.payload;
          state.status = "succeeded";
          state.loading = false;
        }
      )
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.status = "failed";
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
      .addCase(removeSingleGuest.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to remove guest";
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
      })
      .addCase(removeAllGuest.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to remove all guests";
      });
  },
});

export const { setLoading } = rsvpSlice.actions;
export default rsvpSlice.reducer;
