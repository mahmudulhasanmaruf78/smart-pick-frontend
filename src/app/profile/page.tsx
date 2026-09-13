"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, setUser, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken && !authLoading) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3001/users/profile", {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setRole(data.role || "customer");

        // Sync to AuthContext if available
        if (setUser) {
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
          });
        }
      } catch (err: any) {
        setError(err.message || "Could not load profile details");
      } finally {
        setLoading(false);
      }
    };

    if (activeToken) {
      fetchProfile();
    }
  }, [token, authLoading, router, setUser]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    const activeToken = token || localStorage.getItem("token");

    const payload: any = { name, phone };
    if (password.trim().length > 0) {
      payload.password = password;
    }

    try {
      const res = await fetch("http://localhost:3001/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
        throw new Error(errorMsg || "Failed to update profile");
      }

      setMessage("Profile updated successfully!");
      setPassword("");

      // Update state and context
      if (setUser && user) {
        const updated = { ...user, name: data.name || name, phone: data.phone || phone };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch (err: any) {
      setError(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 py-8">
        <Card>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">
                Manage your personal information and contact details
              </p>
            </div>
            <span className="text-xs uppercase px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full border border-blue-200">
              {role || "Customer"}
            </span>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading profile details...
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />

              <Input
                label="Email Address"
                type="email"
                disabled
                value={email}
                helperText="🔒 Email is locked as your verified system identity and cannot be edited."
              />

              <Input
                label="Phone Number"
                required
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX (11 digits)"
              />

              <Input
                label="New Password (Optional)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                helperText="Only fill this field if you want to reset your login password."
              />

              <Button
                type="submit"
                loading={saving}
                variant="primary"
                className="w-full py-2.5 mt-6"
              >
                Save Changes
              </Button>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}