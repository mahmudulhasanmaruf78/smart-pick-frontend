"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardStats } from "@/types/admin";
import AdminLayout from "@/components/layout/AdminLayout";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

export default function AdminDashboardPage() {
  // Dashboard data state
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true); // প্রথমবার পেজ লোডের জন্য
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // ম্যানুয়াল রিফ্রেশ বাটনের জন্য

  // Error state
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Dashboard data fetch function
  const fetchDashboardStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage("");

    try {
      const response = await api.get<DashboardStats>("/admin/dashboard");
      setStats(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const serverMessage = error.response?.data?.message;

        if (statusCode === 401) {
          setErrorMessage("Session expired, please login again.");
        } else if (statusCode === 403) {
          setErrorMessage("Access denied. Admin access only.");
        } else if (serverMessage) {
          setErrorMessage(
            Array.isArray(serverMessage)
              ? serverMessage.join(", ")
              : serverMessage,
          );
        } else {
          setErrorMessage("Failed to load dashboard data.");
        }
      } else {
        setErrorMessage("Failed to connect to server.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const router = useRouter();

  // Page load time data fetch
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!token || role?.toLowerCase() !== "admin") {
      router.push("/login");
      return;
    }
    fetchDashboardStats();
  }, [router]);

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="System metrics and operational overview of SmartPick."
      currentPath="/admin"
      actions={
        <Button
          variant="primary"
          onClick={() => fetchDashboardStats(true)}
          disabled={isLoading || isRefreshing}
          isLoading={isRefreshing}
          className="inline-flex items-center gap-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </Button>
      }
    >
      {/* Error Alert Message */}
      {errorMessage && (
        <Alert variant="error" onClose={() => setErrorMessage("")} className="mb-6">
          {errorMessage}
        </Alert>
      )}

      {/* Initial Loading State */}
        {isLoading ? (
          <div className="mt-8 flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <span className="ml-3 text-base font-medium text-gray-600">
              Loading dashboard metrics...
            </span>
          </div>
        ) : stats ? (
          <div className="mt-8 space-y-8">
            {/* 1. Revenue Highlight Card */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 p-6 text-white shadow-lg sm:p-8">
              {/* Background decorative bubble */}
              <div className="absolute -right-6 -bottom-6 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-sm">
                    <span>💰 Total Revenue</span>
                  </div>

                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    ৳
                    {Number(stats.revenue ?? 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h2>

                  <p className="mt-2 text-sm text-emerald-100">
                    Total revenue earned from all delivered deliveries.
                  </p>
                </div>

                <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm">
                  💵
                </div>
              </div>
            </div>

            {/* 2. User Stats Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">👥</span>
                <h3 className="text-lg font-bold text-gray-900">
                  User Overview
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Users */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">
                      Total Users
                    </p>
                    <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600 text-lg">
                      👥
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {stats.users.total.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    All registered accounts
                  </p>
                </div>

                {/* Total Customers */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">
                      Total Customers
                    </p>
                    <span className="rounded-lg bg-blue-50 p-2 text-blue-600 text-lg">
                      🛍️
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-blue-600">
                    {stats.users.customers.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Package senders</p>
                </div>

                {/* Total Riders */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">
                      Total Riders
                    </p>
                    <span className="rounded-lg bg-purple-50 p-2 text-purple-600 text-lg">
                      🚴
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-purple-600">
                    {stats.users.riders.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Active & pending delivery riders
                  </p>
                </div>

                {/* Total Admins */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">
                      Total Admins
                    </p>
                    <span className="rounded-lg bg-amber-50 p-2 text-amber-600 text-lg">
                      🛡️
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-amber-600">
                    {stats.users.admins.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">System managers</p>
                </div>
              </div>
            </section>

            {/* 3. Order Stats Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📦</span>
                <h3 className="text-lg font-bold text-gray-900">
                  Order Overview
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Total Orders */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Total Orders
                    </p>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      All
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {stats.orders.total.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Lifetime orders placed
                  </p>
                </div>

                {/* Pending Orders */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                      Pending
                    </p>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      Waiting
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-amber-600">
                    {stats.orders.pending.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-amber-700/70">
                    Awaiting rider accept
                  </p>
                </div>

                {/* Accepted Orders */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      Accepted
                    </p>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                      Active
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-blue-600">
                    {stats.orders.accepted.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-blue-700/70">
                    Picked or in transit
                  </p>
                </div>

                {/* Delivered Orders */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      Delivered
                    </p>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Completed
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-emerald-600">
                    {stats.orders.delivered.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-emerald-700/70">
                    Successfully delivered
                  </p>
                </div>

                {/* Cancelled Orders */}
                <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                      Cancelled
                    </p>
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                      Cancelled
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-rose-600">
                    {stats.orders.cancelled.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-rose-700/70">
                    Revoked by user/admin
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Quick Actions / Navigation Cards */}
            <section className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚡</span>
                <h3 className="text-lg font-bold text-gray-900">
                  Management Tools & Quick Actions
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1. Delivery Zones */}
                <Link
                  href="/admin/zones"
                  className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-md"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl group-hover:bg-blue-100 transition">
                      🗺️
                    </div>

                    <h4 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                      Delivery Zones
                    </h4>

                    <p className="mt-1 text-sm text-gray-500">
                      Manage delivery areas, base fares, and distance rates.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                    <span>Manage Zones & Rates</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </Link>

                {/* 2. Rider Verifications */}
                <Link
                  href="/admin/riders"
                  className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl group-hover:bg-emerald-100 transition">
                      🪪
                    </div>

                    <h4 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition">
                      Rider Verifications
                    </h4>

                    <p className="mt-1 text-sm text-gray-500">
                      Check pending rider applications, verify NID and approve
                      accounts.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <span>Verify Riders</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </Link>

                {/* 3. User Management */}
                <Link
                  href="/admin/users"
                  className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-500 hover:shadow-md"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl group-hover:bg-purple-100 transition">
                      ⚙️
                    </div>

                    <h4 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-purple-600 transition">
                      User Management
                    </h4>

                    <p className="mt-1 text-sm text-gray-500">
                      View all system users, inspect profiles, roles, and
                      suspend accounts.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-purple-600">
                    <span>Manage Users</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        ) : null}
    </AdminLayout>
  );
}
