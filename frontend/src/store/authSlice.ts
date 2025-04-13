import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "./store";
import Cookies from "js-cookie";
import {
  LoginResponse,
  SignupPayload,
  StandardResponse,
} from "@/Interface/interface";
import { User } from "@/Types/type";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  signupSuccess: boolean;
  signupMessage: string | null;
  forgotPasswordSuccess: boolean;
  forgotPasswordMessage: string | null;
  resetPasswordSuccess: boolean;
  resetPasswordMessage: string | null;
}

// Initialize state from cookies with safer parsing
let storedUser = null;
try {
  const userCookie = Cookies.get("user");
  if (userCookie && userCookie !== "undefined") {
    storedUser = JSON.parse(userCookie);
  }
} catch (error) {
  console.error("Error parsing user cookie:", error);
  // Clear the invalid cookie
  Cookies.remove("user");
}

const storedToken = Cookies.get("token") || null;

const initialState: AuthState = {
  user: storedUser,
  isAuthenticated: !!storedUser,
  token: storedToken,
  status: "idle",
  error: null,
  signupSuccess: false,
  signupMessage: null,
  forgotPasswordSuccess: false,
  forgotPasswordMessage: null,
  resetPasswordSuccess: false,
  resetPasswordMessage: null,
};

// Helper function for API requests
const makeAuthRequest = async (url: string, data: any) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/auth/${url}`,
      data,
      {
        withCredentials: true,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.data.success) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: response.data.message || `${url} operation failed`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Network error occurred",
    };
  }
};

// Thunks
export const loginUser = createAsyncThunk<
  LoginResponse, // response type
  { email: string; password: string }, // arguement type
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  const result = await makeAuthRequest("login", credentials);

  if (result.success) {
    // Handle nested data structure from API
    const data = result.data.data || result.data;
    const user = data.user;
    const accessToken = data.accessToken;

    // Validate data before storing in cookies
    if (user && accessToken) {
      // Store in cookies
      Cookies.set("token", accessToken, {
        expires: 7,
        path: "/",
        sameSite: "lax",
      });
      Cookies.set("user", JSON.stringify(user), {
        expires: 7,
        path: "/",
        sameSite: "lax",
      });

      return { user, token: accessToken };
    } else {
      return rejectWithValue("Invalid login data received from server");
    }
  }

  return rejectWithValue(result.message);
});

export const signupUser = createAsyncThunk<
  StandardResponse, // return type
  SignupPayload, // arguement type we are expecting
  { rejectValue: string }
>("auth/signup", async (userData, { rejectWithValue }) => {
  const result = await makeAuthRequest("signup", userData);

  if (result.success) {
    return {
      success: true,
      message:
        result.data.message || "Signup successful. Please login to continue.",
    };
  }

  return rejectWithValue(result.message);
});

export const forgotPassword = createAsyncThunk<
  StandardResponse,
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async (data, { rejectWithValue }) => {
  const result = await makeAuthRequest("forgot-password", data);

  if (result.success) {
    return {
      success: true,
      message: result.data.message || "Reset link sent to your email.",
    };
  }

  return rejectWithValue(result.message);
});

export const resetPassword = createAsyncThunk<
  StandardResponse,
  { token: string; password: string; confirmPassword: string },
  { rejectValue: string }
>("auth/resetPassword", async (data, { rejectWithValue }) => {
  const result = await makeAuthRequest("reset-password", data);

  if (result.success) {
    return {
      success: true,
      message: result.data.message || "Password reset successful.",
    };
  }

  return rejectWithValue(result.message);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    clearSignupState: (state) => {
      state.signupSuccess = false;
      state.signupMessage = null;
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

      try {
        Cookies.set("user", JSON.stringify(action.payload), {
          expires: 7,
          path: "/",
          sameSite: "lax",
        });
      } catch (error) {
        console.error("Error setting user cookie:", error);
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.status = "idle";
      state.error = null;
      state.signupSuccess = false;
      state.signupMessage = null;
      state.forgotPasswordSuccess = false;
      state.forgotPasswordMessage = null;
      state.resetPasswordSuccess = false;
      state.resetPasswordMessage = null;

      // Remove cookies
      Cookies.remove("token");
      Cookies.remove("user");

      // Call logout API endpoint
      axios
        .post(
          "http://localhost:5000/api/auth/logout",
          {},
          { withCredentials: true }
        )
        .catch((error) => console.error("Error during logout:", error));
    },
  },
  extraReducers: (builder) => {
    // Generic pending handler
    const setPending = (state: AuthState) => {
      state.status = "loading";
      state.error = null;
    };

    // Generic rejection handler
    const setRejected = (state: AuthState, action: any) => {
      state.status = "failed";
      state.error = action.payload ?? "An error occurred";
    };

    builder
      // Signup
      .addCase(signupUser.pending, setPending)
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log(action);

        state.signupSuccess = action.payload.success;
        state.signupMessage = action.payload.message;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        setRejected(state, action);
        state.signupSuccess = false;
        state.signupMessage = null;
      })

      // Login
      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.error = null;
        state.signupSuccess = false;
        state.signupMessage = null;
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
      });
  },
});

export const {
  resetAuthStatus,
  logout,
  clearSignupState,
  clearForgotPasswordState,
  clearResetPasswordState,
  setUser,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectSignupSuccess = (state: RootState) =>
  state.auth.signupSuccess;
export const selectSignupMessage = (state: RootState) =>
  state.auth.signupMessage;
export const selectForgotPasswordSuccess = (state: RootState) =>
  state.auth.forgotPasswordSuccess;
export const selectForgotPasswordMessage = (state: RootState) =>
  state.auth.forgotPasswordMessage;
export const selectResetPasswordSuccess = (state: RootState) =>
  state.auth.resetPasswordSuccess;
export const selectResetPasswordMessage = (state: RootState) =>
  state.auth.resetPasswordMessage;

export default authSlice.reducer;
