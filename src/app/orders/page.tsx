"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import RiderLayout from "@/components/layout/RiderLayout";
import OrderCard, { Order } from "@/components/orders/OrderCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { VerificationStatus } from "@/types";

export default function OrdersPage() {
  const router = useRouter();
  const { token, role: authRole, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [role, setRole] = useState<string>("");
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);

  // Cancellation modal state
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || authRole;
    if (storedRole) setRole(storedRole.toLowerCase());
  }, [authRole]);

  const fetchOrdersAndProfile = async () => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      router.push("/login");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      // Parallel fetch orders and profile (for rider verification)
      const [ordersRes, profileRes] = await Promise.all([
        fetch(`${apiUrl}/orders/customer/history`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        }),
        fetch(`${apiUrl}/users/profile`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        }).catch(() => null),
      ]);

      if (ordersRes.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          localStorage.removeItem("userName");
        }
        router.push("/login?expired=true");
        return;
      }

      const ordersData = await ordersRes.json();
      if (!ordersRes.ok) {
        throw new Error(ordersData.message || "Failed to load orders");
      }

      setOrders(Array.isArray(ordersData) ? ordersData : []);

      if (profileRes && profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.role) setRole(profileData.role.toLowerCase());
        if (profileData.riderVerification) {
          setVerificationStatus(profileData.riderVerification.status);
        }
      }
    } catch (err: any) {
      setError(err.message || "Could not fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchOrdersAndProfile();
    }
  }, [authLoading]);

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    setError("");
    setSuccessMessage("");

    const activeToken = token || localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${apiUrl}/orders/customer/cancel/${orderToCancel}`,
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

      setSuccessMessage(`Order #${orderToCancel} was cancelled successfully.`);
      setOrderToCancel(null);
      fetchOrdersAndProfile();
    } catch (err: any) {
      setError(err.message || "Could not cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const isRider = role === "rider";

  // Content body
  const ordersContent = (
    <div>
      {/* Header Bar */}
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

      {/* Helpful banner for riders */}
      {isRider && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5 text-blue-900">
            <span className="text-lg">🚴</span>
            <span>
              Looking for open parcels to deliver as a commuter?
            </span>
          </div>
          <Link href="/rider/orders">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              View Available Delivery Pool &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert variant="error" onClose={() => setError("")} className="mb-6">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage("")} className="mb-6">
          {successMessage}
        </Alert>
      )}

      {/* Loading state */}
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
              onCancel={(id) => setOrderToCancel(id)}
            />
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={!!orderToCancel}
        onClose={() => !isCancelling && setOrderToCancel(null)}
        title="Cancel Order Confirmation"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setOrderToCancel(null)}
              disabled={isCancelling}
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmCancel}
              isLoading={isCancelling}
            >
              Yes, Cancel Order
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          Are you sure you want to cancel{" "}
          <span className="font-bold text-gray-900">
            Order #{orderToCancel}
          </span>
          ? This action cannot be undone once processed.
        </p>
      </Modal>
    </div>
  );

  // If user is a rider, render inside RiderLayout with persistent RiderSidebar
  if (isRider) {
    return (
      <RiderLayout
        currentPath="/orders"
        verificationStatus={verificationStatus}
      >
        {ordersContent}
      </RiderLayout>
    );
  }

  // Otherwise, render customer layout with Navbar
  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-8">
        {ordersContent}
      </main>
    </div>
  );
}