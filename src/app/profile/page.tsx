"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import RiderSidebar from "@/components/layout/RiderSidebar";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { RiderVerification, VerificationStatus } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, setUser, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [verification, setVerification] = useState<RiderVerification | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
    const storedName = localStorage.getItem("userName");
    if (storedName) setName(storedName);
  }, []);

  useEffect(() => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!activeToken && !authLoading && mounted) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}/users/profile`, {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });

        if (res.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
            localStorage.removeItem("userName");
          }
          router.push("/login?expired=true");
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setRole(data.role || "customer");
        if (data.riderVerification) {
          setVerification(data.riderVerification);
        }

        if (data.name) {
          localStorage.setItem("userName", data.name);
        }
        if (data.role) {
          localStorage.setItem("role", data.role);
        }

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
  }, [token, authLoading, router, setUser, mounted]);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/users/profile`, {
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

      const updatedName = data.name || name;
      localStorage.setItem("userName", updatedName);

      // Update state and context
      if (setUser && user) {
        const updated = { ...user, name: updatedName, phone: data.phone || phone };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch (err: any) {
      setError(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const isRider =
    role?.toLowerCase() === "rider" ||
    user?.role?.toLowerCase() === "rider" ||
    (mounted && typeof window !== "undefined" && localStorage.getItem("role")?.toLowerCase() === "rider");

  const profileForm = (
    <>
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
        <div className="text-center py-10 text-gray-500 flex items-center justify-center gap-2">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Loading profile details...</span>
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
    </>
  );

  // Rider layout with persistent RiderSidebar on the left
  if (isRider) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <RiderSidebar
          currentPath="/profile"
          verificationStatus={verification?.status}
          riderName={name}
        />

        <main className="flex-1 md:ml-64 min-w-0 px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your rider profile credentials and personal contact details.
              </p>
            </div>

            {/* Rider Verification Details */}
            {verification && (
              <div className="mb-6 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-100">
                    🪪
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      National ID (NID) Verification
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      NID Number:{" "}
                      <span className="font-semibold text-gray-700">
                        {verification.nidNumber || "Submitted"}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  {verification.status === VerificationStatus.Approved ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Verified Rider
                    </span>
                  ) : verification.status === VerificationStatus.Rejected ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Pending Admin Approval
                    </span>
                  )}
                </div>
              </div>
            )}

            <Card>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                  <p className="text-xs text-gray-500">Update your name, contact phone, or password</p>
                </div>
                <span className="text-xs uppercase px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full border border-blue-200">
                  Rider
                </span>
              </div>
              {profileForm}
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Customer / Default Layout with Navbar
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

          {profileForm}
        </Card>
      </main>
    </div>
  );
}