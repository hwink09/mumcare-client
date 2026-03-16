import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getToken, removeToken } from "./token";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8017/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

type RequestWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestWithRetry;
    const status = error.response?.status;
    const msg = (error.response?.data as { message?: string })?.message || "";
    const isExpired =
      status === 401 ||
      status === 403 ||
      status === 410 ||
      msg.toLowerCase().includes("token expired");

    const isAuthEndpoint =
      originalRequest?.url?.includes("/users/auth/login") ||
      originalRequest?.url?.includes("/users/auth/refresh-token");

    if (
      isExpired &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err: unknown) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const resp = await axios.post(
          "http://localhost:8017/v1/users/auth/refresh-token",
          {},
          { withCredentials: true },
        );

        const newAccessToken =
          (resp.data as { accessToken?: string })?.accessToken ||
          (resp.data as { data?: { accessToken?: string } })?.data?.accessToken;

        if (newAccessToken) {
          if (localStorage.getItem("accessToken")) {
            localStorage.setItem("accessToken", newAccessToken);
          } else {
            sessionStorage.setItem("accessToken", newAccessToken);
          }
          processQueue(null, newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } else {
          removeToken();
          processQueue(new Error("No token returned"));
          return Promise.reject(error);
        }
      } catch (refreshError: unknown) {
        removeToken();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
