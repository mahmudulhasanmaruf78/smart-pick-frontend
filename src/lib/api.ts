import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 15000,
});

// Request interceptor: Attach JWT Bearer token to all outgoing requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response interceptor: Invalidate session on 401 Unauthorized (expired or invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear all token and session state immediately
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          localStorage.removeItem("userName");
          sessionStorage.clear();
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } catch (e) {
          console.error("Error purging session on 401", e);
        }

        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
          window.location.href = `/login?expired=true`;
        }
      }
    }
    return Promise.reject(error);
  }
);
