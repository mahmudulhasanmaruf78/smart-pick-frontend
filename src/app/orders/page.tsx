"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  pickupZone: string;
  pickupArea: string;
  dropZone: string;
  dropArea: string;
  parcelType: string;
  weight: number;
  deliveryType: string;
  fare: number;
  status: string;
  createdAt: string;
  rider?: { name: string; phone: string } | null;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Fetch customer's orders on page load
  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/orders/customer/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load orders");
      }

      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Could not fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Logout Handler
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/login");
    }
  };

  // 3. Cancel Order Handler
  const handleCancel = async (orderId: number) => {
    if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;

    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${apiUrl}/orders/customer/cancel/${orderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel order");
      }

      alert("Order cancelled successfully!");
      fetchOrders(); // Refresh order list
    } catch (err: any) {
      alert(err.message || "Could not cancel order");
    }
  };

  // 4. Helper function for colorful status badges
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "accepted":
      case "picked_up":
      case "in_transit":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Navbar with Book Parcel, Profile & Logout */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            SmartPick
          </Link>
          <div className="flex items-center space-x-4 text-sm">
            <Link
              href="/create-order"
              className="bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700 transition"
            >
              + Book New Parcel
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

        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h2>
        <p className="text-sm text-gray-500 mb-6">
          Track active parcel deliveries and view past history.
        </p>

        {/* Error message */}
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading your orders...</div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg p-8">
            <p className="text-gray-600 mb-4">You haven't booked any deliveries yet.</p>
            <Link
              href="/create-order"
              className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium hover:bg-blue-700 transition"
            >
              Book Your First Parcel
            </Link>
          </div>
        ) : (
          /* Orders list */
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Order Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-gray-900">
                      Order #{order.id}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold uppercase ${getStatusBadge(
                        order.status,
                      )}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">From:</span>{" "}
                    {order.pickupArea} ({order.pickupZone})
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">To:</span>{" "}
                    {order.dropArea} ({order.dropZone})
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                    <span>Type: <strong>{order.parcelType}</strong></span>
                    <span>Weight: <strong>{order.weight} kg</strong></span>
                    <span>Speed: <strong>{order.deliveryType}</strong></span>
                    {order.rider && (
                      <span className="text-blue-600">
                        Rider: <strong>{order.rider.name} ({order.rider.phone})</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Delivery Charge</span>
                    <span className="text-xl font-bold text-blue-600">
                      {order.fare} BDT
                    </span>
                  </div>

                  {/* Cancel Button (Only visible for pending or accepted) */}
                  {(order.status.toLowerCase() === "pending" ||
                    order.status.toLowerCase() === "accepted") && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="text-xs text-red-600 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded transition cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
