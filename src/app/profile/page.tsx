"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import RiderLayout from "@/components/layout/RiderLayout";
import CustomerLayout from "@/components/layout/CustomerLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
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
            helperText=" Email is locked as your verified system identity and cannot be edited."
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
      <RiderLayout
        currentPath="/profile"
        verificationStatus={verification?.status}
        riderName={name}
        title="My Profile"
        subtitle="Manage your rider profile credentials and personal contact details."
        maxWidth="max-w-3xl"
      >
        {/* Rider Verification Details */}
        {verification && (
          <div className="mb-6 p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-100">
                
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
              <Badge
                variant={verification.status}
                dot
                size="md"
              >
                {verification.status === VerificationStatus.Approved
                  ? "Verified Rider"
                  : verification.status === VerificationStatus.Rejected
                  ? "Rejected"
                  : "Pending Approval"}
              </Badge>
            </div>
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              <p className="text-xs text-gray-500">Update your name, contact phone, or password</p>
            </div>
            <Badge variant="rider">Rider</Badge>
          </div>
          {profileForm}
        </Card>
      </RiderLayout>
    );
  }

  // Admin Layout with persistent AdminSidebar
  if (role === "admin") {
    return (
      <AdminLayout
        title="Admin Profile"
        subtitle="Manage your administrator personal and credentials information"
        currentPath="/profile"
        maxWidth="max-w-xl"
      >
        <Card>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
              <p className="text-sm text-gray-500">
                Manage your administrator account
              </p>
            </div>
            <Badge variant="admin">Admin</Badge>
          </div>
          {profileForm}
        </Card>
      </AdminLayout>
    );
  }

  // Customer / Default Layout with CustomerSidebar
  return (
    <CustomerLayout currentPath="/profile" maxWidth="max-w-xl">
      <Card>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">
              Manage your personal information and contact details
            </p>
          </div>
          <Badge variant={role || "customer"}>{role || "Customer"}</Badge>
        </div>

        {profileForm}
      </Card>
    </CustomerLayout>
  );
}