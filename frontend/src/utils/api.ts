import axios, { AxiosInstance } from "axios";
import { toast } from "sonner";

interface CustomAxiosInstance extends AxiosInstance {
  onAuthError?: () => void;
}

const api: CustomAxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      toast.error("Server might be down. Please try again later.", {
        id: "server-down",
      });

      return Promise.reject(new Error("SERVER_DOWN"));
    }

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

    if (error.response?.status !== 401 && error.response?.status !== 404) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      toast.error(message + "hh");
    }

    return Promise.reject(error);
  }
);

api.onAuthError = undefined;

export default api;
