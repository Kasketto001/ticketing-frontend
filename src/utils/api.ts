import axios, { AxiosHeaders } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Read accessToken from Zustand persisted storage (key: "auth-storage").
// Persisted shape is { state: { accessToken }, version }
function getPersistedAccessToken(): string | null {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getPersistedAccessToken();
  if (token) {
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      // Fallback for plain object headers
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Global response interceptor: on 401/403/419 clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status as number | undefined;
    if (status === 401 || status === 419) {
      try {
        // Clear persisted auth state only for unauthenticated/expired session
        localStorage.removeItem("auth-storage");
      } catch (e) {
        // Ignore storage errors (private mode / unavailable storage)
        void e;
      }
      // Redirect to login if not already there
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    // Do not destroy session on 403 (forbidden). Let the view handle it.
    return Promise.reject(error);
  }
);

export default api;
