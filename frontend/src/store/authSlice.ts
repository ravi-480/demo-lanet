import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "../utils/axiosConfig";
import type { RootState } from "./store";
import {
  AuthResponseData,
  AuthState,
  LoginResponse,
  SignupPayload,
  StandardResponse,
  User,
} from "@/Interface/interface";
import { toast } from "sonner";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  status: "idle",
  error: null,
  forgotPasswordSuccess: false,
  forgotPasswordMessage: null,
  resetPasswordSuccess: false,
  resetPasswordMessage: null,
};

// Define the type for API response
interface ApiResponse {
  success: boolean;
  data?: AuthResponseData;
  message?: string;
}

// Helper function for API requests
const makeAuthRequest = async (
  url: string,
  data: unknown
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`/auth/${url}`, data, {
      withCredentials: true,
      validateStatus: (status) => status < 500,
    });

    if (response.data.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: response.data.message || `${url} operation failed`,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message || "Network error occurred",
      };
    }
    return {
      success: false,
      message: "Network error occurred",
    };
  }
};

// get current user

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/auth/me");
      return res.data.data;
    } catch (error) {
      console.log(error);

      return rejectWithValue("Failed to fetch user");
    }
  }
);

export const loginUser = createAsyncThunk<
  LoginResponse, // response type
  { email: string; password: string }, // argument type
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  const result = await makeAuthRequest("login", credentials);

  if (result.success && result.data) {
    const data = result.data.data || result.data;
    const user = data.user;
    const accessToken = data.accessToken;

    if (user && accessToken) {
      return { user, token: accessToken };
    } else {
      return rejectWithValue("Invalid login data received from server");
    }
  }

  return rejectWithValue(result.message || "Login failed");
});

export const signupUser = createAsyncThunk<
  StandardResponse, // return type
  SignupPayload, // argument type we are expecting
  { rejectValue: string }
>("auth/signup", async (userData, { rejectWithValue }) => {
  const result = await makeAuthRequest("signup", userData);

  if (result.success && result.data) {
    return {
      success: true,
      message:
        result.data.message || "Signup successful. Please login to continue.",
    };
  }

  return rejectWithValue(result.message || "Signup failed");
});

export const forgotPassword = createAsyncThunk<
  StandardResponse,
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async (data, { rejectWithValue }) => {
  const result = await makeAuthRequest("forgot-password", data);

  if (result.success && result.data) {
    return {
      success: true,
      message: result.data.message || "Reset link sent to your email.",
    };
  }

  return rejectWithValue(result.message || "Password reset request failed");
});

export const resetPassword = createAsyncThunk<
  StandardResponse,
  { token: string; password: string; confirmPassword: string },
  { rejectValue: string }
>("auth/resetPassword", async (data, { rejectWithValue }) => {
  const result = await makeAuthRequest("reset-password", data);

  if (result.success && result.data) {
    return {
      success: true,
      message: result.data.message || "Password reset successful.",
    };
  }

  return rejectWithValue(result.message || "Password reset failed");
});

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error during logout: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },

    clearForgotPasswordState: (state) => {
      state.forgotPasswordSuccess = false;
      state.forgotPasswordMessage = null;
    },
    clearResetPasswordState: (state) => {
      state.resetPasswordSuccess = false;
      state.resetPasswordMessage = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Generic pending handler
    const setPending = (state: AuthState) => {
      state.status = "loading";
      state.error = null;
    };

    // Generic rejection handler
    const setRejected = (
      state: AuthState,
      action: PayloadAction<string | undefined>
    ) => {
      state.status = "failed";
      state.error = action.payload ?? "An error occurred";
    };

    builder
      // Signup
      .addCase(signupUser.pending, setPending)
      .addCase(signupUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        setRejected(state, action);
      })

      // Login
      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, setRejected)

      // Forgot password
      .addCase(forgotPassword.pending, setPending)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.forgotPasswordSuccess = action.payload.success;
        state.forgotPasswordMessage = action.payload.message;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        setRejected(state, action);
        state.forgotPasswordSuccess = false;
        state.forgotPasswordMessage = null;
      })

      // Reset password
      .addCase(resetPassword.pending, setPending)
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.resetPasswordSuccess = action.payload.success;
        state.resetPasswordMessage = action.payload.message;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        setRejected(state, action);
        state.resetPasswordSuccess = false;
        state.resetPasswordMessage = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.status = "idle";
        state.error = null;
        state.forgotPasswordSuccess = false;
        state.forgotPasswordMessage = null;
        state.resetPasswordSuccess = false;
        state.resetPasswordMessage = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const {
  resetAuthStatus,
  clearForgotPasswordState,
  clearResetPasswordState,
  setUser,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;
