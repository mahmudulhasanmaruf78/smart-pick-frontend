"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import OrderCard, { Order } from "@/components/orders/OrderCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

export default function OrdersPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      router.push("/login");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/orders/customer/history`, {
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
        throw new Error(data.message || "Failed to load orders");
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Could not fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading]);

  const handleCancel = async (orderId: number) => {
    if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;

    const activeToken = token || localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${apiUrl}/orders/customer/cancel/${orderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel order");
      }

      alert("Order cancelled successfully!");
      fetchOrders();
    } catch (err: any) {
      alert(err.message || "Could not cancel order");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Consignments</h1>
            <p className="text-sm text-gray-500">
              Track live status and commuter handovers for your deliveries
            </p>
          </div>
          <Link href="/create-order">
            <Button variant="primary" size="md">
              + Book New Parcel
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <svg
              className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 mb-4 text-base">
              You haven't placed any delivery requests yet.
            </p>
            <Link href="/create-order">
              <Button variant="primary">Book Your First Parcel</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}