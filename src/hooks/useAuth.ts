"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn("AuthContext not found. Ensure AuthProvider wraps your app.");
    return {
      user: null,
      token: null,
      role: null,
      loading: false,
      login: () => {},
      logout: () => {},
      setUser: () => {},
    };
  }
  return context;
}
