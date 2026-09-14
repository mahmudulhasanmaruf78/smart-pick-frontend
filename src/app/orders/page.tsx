"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import RiderLayout from "@/components/layout/RiderLayout";
import CustomerLayout from "@/components/layout/CustomerLayout";
import OrderCard from "@/components/orders/OrderCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { Order, VerificationStatus } from "@/types";

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

  // Edit order modal state
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [editPickupArea, setEditPickupArea] = useState("");
  const [editDropArea, setEditDropArea] = useState("");
  const [editParcelType, setEditParcelType] = useState<string>("parcel");
  const [editWeight, setEditWeight] = useState<string>("1");
  const [editDeliveryType, setEditDeliveryType] = useState<string>("regular");
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [editError, setEditError] = useState("");

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
      const currentRole = (localStorage.getItem("role") || authRole || "").toLowerCase();
      const isUserRider = currentRole === "rider";
      const ordersEndpoint = isUserRider
        ? `${apiUrl}/orders/rider/history`
        : `${apiUrl}/orders/customer/history`;

      // Parallel fetch orders and profile (for rider verification)
      const [ordersRes, profileRes] = await Promise.all([
        fetch(ordersEndpoint, {
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

  const handleOpenEdit = (order: Order) => {
    setOrderToEdit(order);
    setEditPickupArea(order.pickupArea || "");
    setEditDropArea(order.dropArea || "");
    setEditParcelType(order.parcelType || "parcel");
    setEditWeight(String(order.weight || "1"));
    setEditDeliveryType(order.deliveryType || "regular");
    setEditError("");
  };

  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToEdit) return;

    if (!editPickupArea.trim() || !editDropArea.trim()) {
      setEditError("Pickup and drop-off areas cannot be empty.");
      return;
    }

    const weightNum = Number(editWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setEditError("Weight must be a positive number.");
      return;
    }

    setIsUpdatingOrder(true);
    setEditError("");
    setError("");

    try {
      const activeToken = token || localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const payload = {
        pickupArea: editPickupArea.trim(),
        dropArea: editDropArea.trim(),
        parcelType: editParcelType,
        weight: weightNum,
        deliveryType: editDeliveryType,
      };

      const res = await fetch(
        `${apiUrl}/orders/customer/edit/${orderToEdit.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      setSuccessMessage(
        `Order #${orderToEdit.id} updated successfully! New fare: ${data.fare} BDT`,
      );
      setOrderToEdit(null);
      fetchOrdersAndProfile();
    } catch (err: any) {
      setEditError(err.message || "Failed to update order");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const isRider = role === "rider";

  // Content body
  const ordersContent = (
    <div>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRider ? "My Deliveries" : "My Orders"}
          </h1>
          <p className="text-sm text-gray-500">
            {isRider
              ? "Track delivery jobs accepted and completed by you"
              : "Track live status, commuter handovers, and history of your orders"}
          </p>
        </div>
        {!isRider ? (
          <Link href="/create-order">
            <Button variant="primary" size="md">
              + Book New Parcel
            </Button>
          </Link>
        ) : (
          <Link href="/rider/orders">
            <Button variant="primary" size="md">
              Browse Available Orders
            </Button>
          </Link>
        )}
      </div>

      {/* Helpful banner for riders */}
      {isRider && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5 text-blue-900">
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
            {isRider
              ? "You haven't accepted or completed any delivery consignments yet."
              : "You haven't placed any delivery requests yet."}
          </p>
          <Link href={isRider ? "/rider/orders" : "/create-order"}>
            <Button variant="primary">
              {isRider ? "Browse Available Orders" : "Book Your First Parcel"}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isRider={isRider}
              onEdit={!isRider ? handleOpenEdit : undefined}
              onCancel={!isRider ? (id) => setOrderToCancel(id) : undefined}
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

      {/* Edit Order Modal */}
      <Modal
        isOpen={!!orderToEdit}
        onClose={() => !isUpdatingOrder && setOrderToEdit(null)}
        title={`Edit Pending Order #${orderToEdit?.id}`}
        size="lg"
      >
        <form onSubmit={handleConfirmEdit} className="space-y-4">
          {editError && (
            <Alert variant="error" onClose={() => setEditError("")}>
              {editError}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Pickup Zone (Fixed)
              </label>
              <input
                type="text"
                disabled
                value={orderToEdit?.pickupZone || ""}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 p-2 text-xs text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Drop-off Zone (Fixed)
              </label>
              <input
                type="text"
                disabled
                value={orderToEdit?.dropZone || ""}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 p-2 text-xs text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <Input
            label="Pickup Address / Area"
            required
            value={editPickupArea}
            onChange={(e) => setEditPickupArea(e.target.value)}
            placeholder="Detailed pickup street/house address"
          />

          <Input
            label="Drop-off Address / Area"
            required
            value={editDropArea}
            onChange={(e) => setEditDropArea(e.target.value)}
            placeholder="Detailed destination street/house address"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parcel Type
              </label>
              <select
                value={editParcelType}
                onChange={(e) => setEditParcelType(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:outline-blue-500"
              >
                <option value="document">Document</option>
                <option value="parcel">Parcel</option>
                <option value="fragile">Fragile</option>
              </select>
            </div>

            <div>
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                min="0.1"
                required
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed
              </label>
              <select
                value={editDeliveryType}
                onChange={(e) => setEditDeliveryType(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-gray-900 focus:outline-blue-500"
              >
                <option value="regular">Regular</option>
                <option value="express">Express</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setOrderToEdit(null)}
              disabled={isUpdatingOrder}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdatingOrder}
            >
              Save Changes
            </Button>
          </div>
        </form>
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

  // Customer layout with persistent CustomerSidebar
  return (
    <CustomerLayout currentPath="/orders">
      {ordersContent}
    </CustomerLayout>
  );
}