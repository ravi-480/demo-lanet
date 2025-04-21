import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface CustomAxiosInstance extends AxiosInstance {
  onAuthError?: () => void;
}

const api: CustomAxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Add request interceptor to include token in every request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Update in your api.ts interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // TRUE server/network error
    if (!error.response) {
      // Silent toast for better user experience
      toast.error("Server might be down. Please try again later.", {
        id: "server-down", // Using an ID prevents duplicate toasts
      });

      // Throw custom error but don't console.log it
      return Promise.reject(new Error("SERVER_DOWN"));
    }

    // Handle unauthorized + token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      try {
        const ans = await api.post("/auth/refresh-token");
        const newToken = ans.data?.accessToken;
        if (newToken) {
          Cookies.set("token", newToken, { path: "/", sameSite: "lax" });
          return api(originalRequest);
        }
        // If no new token received, handle as auth error
        if (api.onAuthError) {
          api.onAuthError();
        }
        return Promise.reject(new Error("AUTH_ERROR"));
      } catch (refreshError) {
        if (api.onAuthError) {
          api.onAuthError();
        }
        // Return a custom error that we can filter
        return Promise.reject(new Error("AUTH_ERROR"));
      }
    }

    // Show error message for errors other than 401
    if (error.response?.status !== 401) {
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
