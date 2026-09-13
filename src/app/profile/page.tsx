"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  // 1. User state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(""); // optional for changing password
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 2. Fetch profile on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3001/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
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
      } catch (err: any) {
        setError(err.message || "Could not load profile details");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // 3. Logout handler
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/login");
    }
  };

  // 4. Save Changes handler (PATCH /users/profile)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    const token = localStorage.getItem("token");

    // Only send fields that can be updated (email is excluded!)
    const payload: any = { name, phone };
    if (password.trim().length > 0) {
      payload.password = password;
    }

    try {
      const res = await fetch("http://localhost:3001/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      setPassword(""); // Clear password field after save
    } catch (err: any) {
      setError(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans p-4">
      <div className="max-w-xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm mt-8">
        {/* Navbar */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-blue-600">
            SmartPick
          </Link>
          <div className="flex items-center space-x-4 text-sm">
            <Link href="/create-order" className="text-gray-600 hover:text-blue-600 font-medium">
              Book Parcel
            </Link>
            <Link href="/orders" className="text-gray-600 hover:text-blue-600 font-medium">
              My Orders
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            <p className="text-sm text-gray-500">Manage your account information</p>
          </div>
          <span className="text-xs uppercase px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-full">
            {role}
          </span>
        </div>

        {/* Alert Feedback Messages */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading profile...</div>
        ) : (
          /* Profile Form */
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Full Name (Editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              />
            </div>

            {/* Email (Read-Only / Disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address (Cannot be changed)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full border border-gray-200 bg-gray-100 text-gray-500 p-2 rounded cursor-not-allowed"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                🔒 Email is locked as your permanent account identifier.
              </span>
            </div>

            {/* Phone Number (Editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (11 digits)
              </label>
              <input
                type="text"
                required
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              />
            </div>

            {/* Change Password (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password (Optional)
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep your current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Only enter if you want to set a new password.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded hover:bg-blue-700 transition mt-6 cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
