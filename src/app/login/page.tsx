"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email/phone or password");
      }

      // Update global AuthContext and localStorage
      login(data.accessToken, data.user);

      // Route based on role
      const role = data.user?.role?.toLowerCase();
      if (role === "rider") {
        router.push("/rider/orders");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/orders");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl font-bold text-blue-600 tracking-tight">
            SmartPick
          </Link>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email or Phone Number"
              type="text"
              required
              placeholder="e.g. demo@gmail.com or 01712345678"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              loading={loading}
              variant="primary"
              className="w-full py-2.5 mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-100">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}