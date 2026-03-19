const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const withProtocol = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("localhost") || value.startsWith("127.0.0.1")) {
    return `http://${value}`;
  }

  return `https://${value}`;
};

const getDefaultApiOrigin = () =>
  import.meta.env.DEV
    ? "http://localhost:8017"
    : "https://mumcare.onrender.com";

const rawApiOrigin =
  import.meta.env.VITE_API_ORIGIN ||
  import.meta.env.VITE_BASE_URL ||
  getDefaultApiOrigin();

export const API_ROOT = trimTrailingSlash(withProtocol(rawApiOrigin.trim()));
export const API_V1_ROOT = `${API_ROOT}/v1`;
export const SOCKET_URL = trimTrailingSlash(
  withProtocol((import.meta.env.VITE_SOCKET_URL || API_ROOT).trim()),
);
