import axios, { AxiosInstance } from "axios";
import { toast } from "sonner";

interface CustomAxiosInstance extends AxiosInstance {
  onAuthError?: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api: CustomAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (
      response.config.method !== "get" &&
      !response.config.headers["x-skip-success-toast"]
    ) {
      const successMessage =
        response.data?.message || "Action completed successfully!";
      toast.success(successMessage);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      toast.error("Server might be down. Please try again later.", {
        id: "server-down",
      });

      return Promise.reject(new Error("SERVER_DOWN"));
    }

    const status = error.response?.status;

    if (status === 429) {
      const message =
        error.response?.data?.message ||
        "Too many requests, please try again later.";

      toast.error(message, {
        id: "rate-limit",
      });

      return Promise.reject(new Error("RATE_LIMIT"));
    }

    // Handle 401 Unauthorized errors
    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      const errorMessage = error.response?.data?.message || "";
      if (errorMessage.startsWith("NO_REFRESH_TOKEN:")) {
        toast.error("Session expired. Please log in again.");
        if (api.onAuthError) {
          api.onAuthError();
        }
        return Promise.reject(new Error("AUTH_ERROR"));
      }

      try {
        const refreshResponse = await api.post(
          "/auth/refresh-token",
          {},
          { headers: { "x-skip-success-toast": "true" } }
        );
        const newToken = refreshResponse.data?.data?.accessToken;

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the original request
          return api(originalRequest);
        } else {
          if (api.onAuthError) {
            api.onAuthError();
          }
          return Promise.reject(new Error("AUTH_ERROR"));
        }
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError);
        if (api.onAuthError) {
          api.onAuthError();
        }
        return Promise.reject(new Error("AUTH_ERROR"));
      }
    }

    if (status !== 401 && status !== 404) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      toast.error(message);
    }

    return Promise.reject(error);
  }
);

api.onAuthError = undefined;

export default api;
