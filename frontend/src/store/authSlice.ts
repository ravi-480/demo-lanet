import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "./store";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

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

const storedUser = Cookies.get("user")
  ? JSON.parse(Cookies.get("user")!)
  : null;
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

// Existing login and signup thunks

export const loginUser = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      credentials,
      {
        withCredentials: true,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.data.success) {
      const { user, token } = response.data.data || response.data;

      // Store token in client-side cookie (for client access)
      Cookies.set("token", token, {
        expires: 7,
        path: "/",
        sameSite: "lax",
      });

      // Store user data in a cookie
      Cookies.set("user", JSON.stringify(user), {
        expires: 7,
        path: "/",
        sameSite: "lax",
      });

      return { user, token };
    }

    return rejectWithValue(response.data.message || "Login failed");
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Network error occurred"
    );
  }
});

export const signupUser = createAsyncThunk<
  SignupResponse,
  { name: string; email: string; password: string; confirmPassword: string },
  { rejectValue: string }
>("auth/signup", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/signup",
      userData,
      {
        withCredentials: true,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.data.success) {
      return {
        success: true,
        message:
          response.data.message ||
          "Signup successful. Please login to continue.",
      };
    }

    return rejectWithValue(response.data.message || "Signup failed");
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Network error occurred"
    );
  }
});

// New forgot password thunk
export const forgotPassword = createAsyncThunk<
  ForgotPasswordResponse,
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/forgot-password",
      data,
      {
        withCredentials: true,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Reset link sent to your email.",
      };
    }

    return rejectWithValue(
      response.data.message || "Failed to send reset link"
    );
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Network error occurred"
    );
  }
});

// New reset password thunk
export const resetPassword = createAsyncThunk<
  ResetPasswordResponse,
  { token: string; password: string; confirmPassword: string },
  { rejectValue: string }
>("auth/resetPassword", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/reset-password",
      data,
      {
        withCredentials: true,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Password reset successful.",
      };
    }

    return rejectWithValue(response.data.message || "Failed to reset password");
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Network error occurred"
    );
  }
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
    // Add the setUser reducer
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;

      // Optionally update the cookie as well to keep things in sync
      Cookies.set("user", JSON.stringify(action.payload), {
        expires: 7,
        path: "/",
        sameSite: "lax",
      });
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

      // Call logout API endpoint to clear HttpOnly cookies
      axios
        .post(
          "http://localhost:5000/api/auth/logout",
          {},
          {
            withCredentials: true,
          }
        )
        .catch((error) => {
          console.error("Error during logout:", error);
        });
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup cases
      .addCase(signupUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.signupSuccess = false;
        state.signupMessage = null;
      })
      .addCase(
        signupUser.fulfilled,
        (state, action: PayloadAction<SignupResponse>) => {
          state.status = "succeeded";
          state.signupSuccess = action.payload.success;
          state.signupMessage = action.payload.message;
          state.error = null;
        }
      )
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "An error occurred";
        state.signupSuccess = false;
        state.signupMessage = null;
      })

      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.status = "succeeded";
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.error = null;
          // Reset signup flags after successful login
          state.signupSuccess = false;
          state.signupMessage = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "An error occurred";
      })

      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.forgotPasswordSuccess = false;
        state.forgotPasswordMessage = null;
      })
      .addCase(
        forgotPassword.fulfilled,
        (state, action: PayloadAction<ForgotPasswordResponse>) => {
          state.status = "succeeded";
          state.forgotPasswordSuccess = action.payload.success;
          state.forgotPasswordMessage = action.payload.message;
          state.error = null;
        }
      )
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "An error occurred";
        state.forgotPasswordSuccess = false;
        state.forgotPasswordMessage = null;
      })

      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.resetPasswordSuccess = false;
        state.resetPasswordMessage = null;
      })
      .addCase(
        resetPassword.fulfilled,
        (state, action: PayloadAction<ResetPasswordResponse>) => {
          state.status = "succeeded";
          state.resetPasswordSuccess = action.payload.success;
          state.resetPasswordMessage = action.payload.message;
          state.error = null;
        }
      )
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "An error occurred";
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
  setUser, // Export the new setUser action
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
