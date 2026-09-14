"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/auth/register-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
        throw new Error(errorMsg || "Registration failed");
      }

      alert("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check inputs.");
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
          <p className="text-gray-500 text-sm mt-1">
            Create your Customer Account to send parcels
          </p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Rahat Islam"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Phone Number (11 digits)"
              type="text"
              required
              maxLength={11}
              placeholder="01712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="w-full space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min. 6 chars with special character"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 bg-white p-2 pr-16 rounded text-black transition focus:outline-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Password must include lowercase, uppercase, number & symbol.
              </p>
            </div>

            <Button
              type="submit"
              loading={loading}
              variant="primary"
              className="w-full py-2.5 mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-100">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}