"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function OrderForm() {
  const router = useRouter();

  const [pickupZone, setPickupZone] = useState("Inside Dhaka");
  const [pickupArea, setPickupArea] = useState("");
  const [dropZone, setDropZone] = useState("Inside Dhaka");
  const [dropArea, setDropArea] = useState("");
  const [parcelType, setParcelType] = useState("document");
  const [weight, setWeight] = useState(1);
  const [deliveryType, setDeliveryType] = useState("regular");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to book an order.");
      router.push("/login");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      router.push("/orders");
    } catch (err: any) {
      setError(err.message || "Could not create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {/* Pickup Zone & Address */}
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

        <Input
          label="Pickup Address"
          required
          placeholder="e.g. Dhanmondi 27, House 12"
          value={pickupArea}
          onChange={(e) => setPickupArea(e.target.value)}
        />
      </div>

      {/* Destination Zone & Address */}
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

        <Input
          label="Destination Address"
          required
          placeholder="e.g. Kuril, AIUB Gate 1"
          value={dropArea}
          onChange={(e) => setDropArea(e.target.value)}
        />
      </div>

      {/* Parcel Info */}
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

      <Button type="submit" loading={loading} className="w-full py-3 mt-6">
        Confirm & Book Delivery
      </Button>
    </form>
  );
}