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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/register-customer", {
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

      alert("🎉 Account created successfully! Please sign in.");
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

            <Input
              label="Password"
              type="password"
              required
              placeholder="Min. 6 chars with special character"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Password must include lowercase, uppercase, number & symbol."
            />

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