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
    if (response.config.method !== "get") {
      console.log(response);

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

    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      try {
        const ans = await api.post("/auth/refresh-token");
        const newToken = ans.data?.accessToken;
        if (newToken) {
          return api(originalRequest);
        }
        if (api.onAuthError) {
          api.onAuthError();
        }
        return Promise.reject(new Error("AUTH_ERROR"));
      } catch (refreshError) {
        console.log(refreshError);

        if (api.onAuthError) {
          api.onAuthError();
        }
        return Promise.reject(new Error("AUTH_ERROR"));
      }
    }

    if (status !== 401 && status !== 404 && status >= 500) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      console.log(error);

      toast.error(message);
    }

    return Promise.reject(error);
  }
);

api.onAuthError = undefined;

export default api;
