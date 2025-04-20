import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

interface CustomAxiosInstance extends AxiosInstance {
  onAuthError?: () => void;
}

const api: CustomAxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop and avoid retrying the refresh-token endpoint itself
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
        }

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Logout or redirect via callback
        if (api.onAuthError) {
          api.onAuthError();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

api.onAuthError = undefined;

export default api;
