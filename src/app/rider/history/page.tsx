"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import RiderLayout from "@/components/layout/RiderLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import { Order, OrderStatus, VerificationStatus } from "@/types";

export default function RiderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHistoryAndProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const [historyRes, profileRes] = await Promise.all([
        api.get<Order[]>("/orders/rider/history"),
        api.get("/users/profile").catch(() => null),
      ]);

      setOrders(Array.isArray(historyRes.data) ? historyRes.data : []);

      if (profileRes?.data?.riderVerification) {
        setVerificationStatus(profileRes.data.riderVerification.status);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load delivery history. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role =
      typeof window !== "undefined" ? localStorage.getItem("role") : null;

    if (!token || role?.toLowerCase() !== "rider") {
      router.push("/login");
      return;
    }

    fetchHistoryAndProfile();
  }, [router]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter(
      (o) => o.status?.toLowerCase() === OrderStatus.Delivered.toLowerCase(),
    ).length;
    const inProgress = orders.filter((o) =>
      [
        OrderStatus.Accepted.toLowerCase(),
        OrderStatus.PickedUp.toLowerCase(),
        OrderStatus.InTransit.toLowerCase(),
      ].includes(o.status?.toLowerCase()),
    ).length;
    const totalEarnings = orders
      .filter(
        (o) => o.status?.toLowerCase() === OrderStatus.Delivered.toLowerCase(),
      )
      .reduce((sum, o) => sum + (Number(o.fare) || 0), 0);

    return { total, delivered, inProgress, totalEarnings };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "in_progress") {
          const inProgress = [
            OrderStatus.Accepted.toLowerCase(),
            OrderStatus.PickedUp.toLowerCase(),
            OrderStatus.InTransit.toLowerCase(),
          ];
          if (!inProgress.includes(order.status?.toLowerCase())) return false;
        } else if (order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = String(order.id).includes(q);
        const matchesPickup =
          order.pickupArea?.toLowerCase().includes(q) ||
          order.pickupZone?.toLowerCase().includes(q);
        const matchesDrop =
          order.dropArea?.toLowerCase().includes(q) ||
          order.dropZone?.toLowerCase().includes(q);
        const matchesCustomer =
          order.customer?.name?.toLowerCase().includes(q) ||
          order.customer?.phone?.toLowerCase().includes(q);
        const matchesParcel = order.parcelType?.toLowerCase().includes(q);

        return (
          matchesId ||
          matchesPickup ||
          matchesDrop ||
          matchesCustomer ||
          matchesParcel
        );
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <RiderLayout
      currentPath="/rider/history"
      verificationStatus={verificationStatus}
    >
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Delivery History
            </h1>
            <p className="text-sm text-gray-500">
              Complete record of all orders and consignments handled by you
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistoryAndProfile}
              isLoading={loading}
            >
              Refresh
            </Button>
            <Link href="/rider/orders">
              <Button variant="primary" size="sm">
                Browse Available Orders &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Deliveries
            </span>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-2xs">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Delivered
            </span>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {stats.delivered}
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-2xs">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              In Progress
            </span>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {stats.inProgress}
            </p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 shadow-2xs">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Total Earnings
            </span>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              {stats.totalEarnings.toFixed(2)}{" "}
              <span className="text-sm font-normal text-amber-600">BDT</span>
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter(OrderStatus.Delivered)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === OrderStatus.Delivered
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Delivered ({stats.delivered})
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === "in_progress"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              In Progress ({stats.inProgress})
            </button>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by ID, Area, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Orders List / Loading / Empty State */}
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
            Loading your delivery history...
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="text-center py-14">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">
              No delivery records found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No delivery matches your active filters. Try clearing your search query."
                : "You have not accepted or delivered any orders yet. Open the Available Orders board to find your first delivery job."}
            </p>
            <div className="mt-5">
              <Link href="/rider/orders">
                <Button variant="primary" size="md">
                  Browse Available Orders
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isDelivered =
                order.status?.toLowerCase() ===
                OrderStatus.Delivered.toLowerCase();
              const isActive = [
                OrderStatus.Accepted.toLowerCase(),
                OrderStatus.PickedUp.toLowerCase(),
                OrderStatus.InTransit.toLowerCase(),
              ].includes(order.status?.toLowerCase());

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs hover:shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base text-gray-900">
                        Order #{order.id}
                      </span>
                      <Badge status={order.status} />
                      {isActive && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 animate-pulse">
                          Active In Hand
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 pt-1">
                      <div>
                        <span className="font-semibold text-gray-900">
                          Pickup:
                        </span>{" "}
                        {order.pickupArea} ({order.pickupZone})
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Drop-off:
                        </span>{" "}
                        {order.dropArea} ({order.dropZone})
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                      <span>
                        Type: <strong>{order.parcelType}</strong>
                      </span>
                      <span>
                        Weight: <strong>{order.weight} kg</strong>
                      </span>
                      <span>
                        Speed: <strong>{order.deliveryType}</strong>
                      </span>
                      {order.customer && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800 font-medium border border-emerald-200">
                          Customer: {order.customer.name} (
                          {order.customer.phone})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">
                        {isDelivered ? "Earned Fare" : "Order Fare"}
                      </span>
                      <span className="text-xl font-bold text-emerald-600">
                        +{order.fare} BDT
                      </span>
                    </div>

                    {isActive && (
                      <Link href="/rider/deliver">
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs"
                        >
                          Manage Delivery &rarr;
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RiderLayout>
  );
}
