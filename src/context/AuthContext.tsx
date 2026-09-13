"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  logout: () => void;
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
      setRole(userData.role || "customer");
      localStorage.setItem("role", userData.role || "customer");
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    if (confirm("Are you sure you want to log out?")) {
      setToken(null);
      setUser(null);
      setRole(null);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

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