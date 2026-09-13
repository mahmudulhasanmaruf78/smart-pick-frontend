"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateOrderPage() {
  const router = useRouter();

  // 1. Form state variables
  const [pickupZone, setPickupZone] = useState("Inside Dhaka");
  const [pickupArea, setPickupArea] = useState("");
  const [dropZone, setDropZone] = useState("Inside Dhaka");
  const [dropArea, setDropArea] = useState("");
  const [parcelType, setParcelType] = useState("document");
  const [weight, setWeight] = useState(1); // in kg
  const [deliveryType, setDeliveryType] = useState("regular");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 2. Check if customer is logged in on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to book an order.");
      router.push("/login");
    }
  }, [router]);

  // 3. Logout Handler
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/login");
    }
  };

  // 4. Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass JWT Badge
        },
        body: JSON.stringify({
          pickupZone,
          pickupArea,
          dropZone,
          dropArea,
          parcelType,
          weight: Number(weight),
          deliveryType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
        throw new Error(errorMsg || "Failed to create order");
      }

      alert(`🎉 Order created successfully! Total Fare: ${data.fare} BDT`);
      router.push("/orders"); // Take to order history
    } catch (err: any) {
      setError(err.message || "Could not create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans p-4">
      <div className="max-w-xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm mt-8">
        {/* Navbar with My Orders, Profile & Logout */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-blue-600">
            SmartPick
          </Link>
          <div className="flex items-center space-x-4 text-sm">
            <Link
              href="/orders"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              My Orders
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-medium cursor-pointer transition"
            >
              Logout
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-gray-900">Book a Consignment</h2>
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details below. Our commuter network will pick it up along their route.
        </p>

        {/* Error box */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pickup Zone & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Zone
              </label>
              <select
                value={pickupZone}
                onChange={(e) => setPickupZone(e.target.value)}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              >
                <option value="Inside Dhaka">Inside Dhaka</option>
                <option value="Outside Dhaka">Outside Dhaka</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Address
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dhanmondi 27, House 12"
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Drop Zone & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Zone
              </label>
              <select
                value={dropZone}
                onChange={(e) => setDropZone(e.target.value)}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              >
                <option value="Inside Dhaka">Inside Dhaka</option>
                <option value="Outside Dhaka">Outside Dhaka</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Address
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kuril, AIUB Gate 1"
                value={dropArea}
                onChange={(e) => setDropArea(e.target.value)}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Parcel Type, Weight & Speed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parcel Type
              </label>
              <select
                value={parcelType}
                onChange={(e) => setParcelType(e.target.value)}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              >
                <option value="document">Document</option>
                <option value="parcel">Parcel / Box</option>
                <option value="fragile">Fragile / Glass</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Speed
              </label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="w-full border border-gray-300 bg-white text-black p-2 rounded focus:outline-blue-500"
              >
                <option value="regular">Regular</option>
                <option value="express">Express</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition mt-6 cursor-pointer"
          >
            {loading ? "Calculating Fare & Booking..." : "Confirm & Book Delivery"}
          </button>
        </form>
      </div>
    </div>
  );
}
