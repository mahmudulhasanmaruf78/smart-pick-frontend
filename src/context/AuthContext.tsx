"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  login: (token: string, userData?: any) => void;
  logout: (confirmPrompt?: boolean | any) => void;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  role: null,
  loading: true,
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage on client mount
    try {
      const storedToken = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
        setRole(storedRole || "customer");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (e) {
      console.error("Failed to load auth from localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, userData?: any) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);

    if (userData) {
      setUser(userData);
      const userRole = userData.role || "customer";
      setRole(userRole);
      localStorage.setItem("role", userRole);
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.name) {
        localStorage.setItem("userName", userData.name);
      }
    }
  };

  const logout = useCallback(
    (confirmPrompt?: boolean | any) => {
      const shouldConfirm =
        typeof confirmPrompt === "boolean" ? confirmPrompt : true;
      if (shouldConfirm && typeof window !== "undefined") {
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (!confirmed) return;
      }

      // Clear all session state
      setToken(null);
      setUser(null);
      setRole(null);

      // Clear storage and session artifacts
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          localStorage.removeItem("userName");
          sessionStorage.clear();

          // Expire any auth cookie
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } catch (e) {
          console.error("Error during session logout cleanup", e);
        }
      }

      // Redirect to login
      router.push("/login");
    },
    [router],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
