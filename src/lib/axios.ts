import { CookieKeys } from "@/constants/auth";
import axios from "axios";
import Cookies from "@/lib/secureCookieHelper";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Shared pause so parallel 429 retries don't stampede Laravel throttle. */
let rateLimitPauseUntil = 0;

const waitIfRateLimited = async () => {
  const waitMs = rateLimitPauseUntil - Date.now();
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
};

api.interceptors.request.use(
  async (config) => {
    await waitIfRateLimited();
    const token = Cookies.get("priobank-lite-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config as
      | (typeof error.config & { __retryCount?: number })
      | undefined;

    if (status === 401) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        console.warn("[Axios] Unauthorized! Redirecting to login.");
        Cookies.remove("priobank-lite-token", { path: "/" });
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Respect Laravel throttle (429): wait Retry-After / body.retry_after, then retry.
    if (status === 429 && config) {
      const retryCount = config.__retryCount ?? 0;
      if (retryCount < 4) {
        config.__retryCount = retryCount + 1;
        const retryAfterHeader = Number(
          error.response?.headers?.["retry-after"],
        );
        const retryAfterBody = Number(
          error.response?.data?.details?.retry_after ??
            error.response?.data?.retry_after,
        );
        const retryAfterSec = Number.isFinite(retryAfterHeader)
          ? retryAfterHeader
          : Number.isFinite(retryAfterBody)
            ? retryAfterBody
            : NaN;
        const delayMs = Number.isFinite(retryAfterSec)
          ? Math.max(1000, retryAfterSec * 1000)
          : 1000 * Math.pow(2, retryCount + 1);
        rateLimitPauseUntil = Math.max(
          rateLimitPauseUntil,
          Date.now() + delayMs,
        );
        await waitIfRateLimited();
        return api.request(config);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

export interface ApiData {
  url: string;
  bodyData?: any;
}

export const doGetApiCall = async (data: ApiData) => {
  const response = await api.get(data.url);
  return response.data;
};

export const doPostApiCall = async (
  data: ApiData,
  content: string = "application/json",
) => {
  const config =
    content === "multipart/form-data"
      ? {
          headers: { "Content-Type": "multipart/form-data" },
        }
      : undefined;
  const response = await api.post(data.url, data.bodyData, config);
  return response.data;
};

export const doPutApiCall = async (data: ApiData) => {
  const response = await api.put(data.url, data.bodyData);
  return response.data;
};
