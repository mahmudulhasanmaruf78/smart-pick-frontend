"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // 1. State to store what user types
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Submit handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop page from refreshing
    setError("");
    setLoading(true);

    try {
      // Send credentials to our NestJS backend
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      // 3. Save the JWT token in the browser
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("role", data.user?.role || "customer");

      alert("Login successful! Welcome back.");

      // 4. Redirect based on role
      if (data.user?.role === "rider") {
        router.push("/rider/orders");
      } else if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/orders"); // Customer goes to orders
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 border rounded-lg shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            📦 SmartPick
          </Link>
          <h2 className="text-xl font-bold text-gray-800 mt-2">Sign in to your account</h2>
        </div>

        {/* Error message box (only shows if error exists) */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or Phone
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
            />

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded focus:outline-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
