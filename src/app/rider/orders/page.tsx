"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { api } from "@/lib/api";
import { DeliveryZone, Order, User, VerificationStatus } from "@/types";
import RiderSidebar from "@/components/layout/RiderSidebar";

export default function RiderOrdersPage() {
  // Available orders list
  const [orders, setOrders] = useState<Order[]>([]);
  const [riderName, setRiderName] = useState("");

  // Zone filter states
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState("");

  // Rider NID verification status
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);

  // Data loading state
  const [isLoading, setIsLoading] = useState(true);

  // currently accepting order
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  // Feedback messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Rider approved or not
  const isVerified = verificationStatus === VerificationStatus.Approved;

  const loadRiderProfile = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<User>("/users/profile");

      if (response.data?.name) {
        setRiderName(response.data.name);
      }

      const status =
        response.data.riderVerification?.status ?? VerificationStatus.Pending;

      setVerificationStatus(status);

      //  If not approved then no data will be fetched
      if (status !== VerificationStatus.Approved) {
        setOrders([]);
        setZones([]);
        return;
      }
      // Only approved rider will fetch zones and orders
      const [zonesResponse, ordersResponse] = await Promise.all([
        api.get<DeliveryZone[]>("/zones"),
        api.get<Order[]>("/orders/available"),
      ]);

      setZones(zonesResponse.data || []);
      setOrders(ordersResponse.data || []);
    } catch (error: unknown) {
      setOrders([]);
      setZones([]);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setErrorMessage("You do not have permission to view this page.");
        } else if (error.response?.status === 401) {
          setErrorMessage(
            "Your login session has expired. Please login again.",
          );
        } else {
          const serverMessage = error.response?.data?.message;

          setErrorMessage(
            Array.isArray(serverMessage)
              ? serverMessage.join(", ")
              : serverMessage || "Failed to load rider profile.",
          );
        }
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRiderProfile();
  }, []);

  // Filter orders based on zone selection
  const filteredOrders = useMemo(() => {
    if (!selectedZone) {
      return orders;
    }

    return orders.filter((order) => order.pickupZone === selectedZone);
  }, [orders, selectedZone]);

  // handle zone change
  const handleRefresh = async () => {
    if (!isVerified) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.get<Order[]>("/orders/available");

      setOrders(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setErrorMessage("You are not allowed to view available orders.");
        } else {
          const serverMessage = error.response?.data?.message;

          setErrorMessage(
            Array.isArray(serverMessage)
              ? serverMessage.join(", ")
              : serverMessage || "Failed to refresh orders.",
          );
        }
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format zone names for display
  const formatLabel = (value: string) => {
    return value
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const handleAcceptOrder = async (orderId: number) => {
    // prevent multiple click on same order
    if (acceptingId !== null) {
      return;
    }

    setAcceptingId(orderId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.patch(`/orders/accept/${orderId}`);

      setSuccessMessage("Order accepted successfully!");

      // remove accepted order from local order list
      setOrders((currentOrders) =>
        currentOrders.filter((order) => order.id !== orderId),
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setErrorMessage("You are not allowed to accept this order.");
        } else {
          const serverMessage = error.response?.data?.message;

          setErrorMessage(
            Array.isArray(serverMessage)
              ? serverMessage.join(", ")
              : serverMessage || "Order not accepted.",
          );
        }
      } else {
        setErrorMessage("Server is not responding.");
      }
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <RiderSidebar
        currentPath="/rider/orders"
        verificationStatus={verificationStatus}
        riderName={riderName}
      />

      <main className="flex-1 md:ml-64 min-w-0 px-4 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Orders</h1>

          <p className="mt-2 text-gray-600">
            Find and accept available delivery orders.
          </p>
        </div>

        {/* Loading profile */}
        {isLoading && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

            <p className="text-sm font-medium">
              Checking rider verification status...
            </p>
          </div>
        )}

        {/* Pending verification banner */}
        {!isLoading && verificationStatus === VerificationStatus.Pending && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 px-5 py-4 text-yellow-800"
          >
            <h2 className="font-semibold">NID verification pending</h2>

            <p className="mt-1 text-sm">
              Your NID is pending approval. You cannot view or accept delivery
              jobs yet.
            </p>
          </div>
        )}

        {/* Rejected verification banner */}
        {!isLoading && verificationStatus === VerificationStatus.Rejected && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-300 bg-red-50 px-5 py-4 text-red-700"
          >
            <h2 className="font-semibold">NID verification rejected</h2>

            <p className="mt-1 text-sm">
              Your NID verification was rejected. Please contact support or
              submit valid information again.
            </p>
          </div>
        )}

        {/* API error */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-300 bg-green-50 px-5 py-4"
          >
            <p className="text-sm font-medium text-green-700">
              {successMessage}
            </p>

            <Link
              href="/rider/deliver"
              className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              View Active Delivery
            </Link>
          </div>
        )}

        {/* Approved rider content */}
        {isVerified && (
          <section>
            {/* Header controls */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Available Delivery Orders
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                  Choose an order and accept it for delivery.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed"
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* Zone filter */}
            <div className="mb-6">
              <label
                htmlFor="zone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Filter by Zone
              </label>

              <select
                id="zone"
                value={selectedZone}
                onChange={(event) => setSelectedZone(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Zones</option>

                {zones.map((zone) => (
                  <option key={zone.id} value={zone.name}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtered orders */}
            {/* Order count */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                Showing {filteredOrders.length} available jobs
              </p>
            </div>

            {/* Empty state */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                  📦
                </div>

                <h2 className="text-lg font-semibold text-gray-800">
                  No available orders right now
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  No available orders right now. Check back soon!
                </p>
              </div>
            ) : (
              /* Order cards grid */
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {filteredOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900">
                        Order #{order.id}
                      </h2>

                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                        Pending
                      </span>
                    </div>

                    {/* Pickup location */}
                    <div className="mt-5 flex gap-3">
                      <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />

                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                          Pickup
                        </p>

                        <p className="mt-1 font-medium text-gray-800">
                          {order.pickupArea}
                        </p>

                        <p className="text-sm text-gray-500">
                          {order.pickupZone || "Zone not available"}
                        </p>
                      </div>
                    </div>

                    {/* Connecting line */}
                    <div className="ml-1.5 h-5 border-l-2 border-dashed border-gray-300" />

                    {/* Drop location */}
                    <div className="flex gap-3">
                      <div className="mt-1 h-3 w-3 rounded-full bg-red-500" />

                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                          Drop-off
                        </p>

                        <p className="mt-1 font-medium text-gray-800">
                          {order.dropArea}
                        </p>

                        <p className="text-sm text-gray-500">
                          {order.dropZone || "Zone not available"}
                        </p>
                      </div>
                    </div>

                    {/* Parcel and delivery badges */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        📦 {formatLabel(order.parcelType)}
                      </span>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        🚚 {formatLabel(order.deliveryType)}
                      </span>
                    </div>

                    {/* Weight and fare */}
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-xs text-gray-500">Weight</p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {Number(order.weight).toFixed(2)} kg
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Rider earning</p>

                        <p className="mt-1 font-bold text-green-600">
                          ৳{Number(order.fare).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Accept button */}
                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={acceptingId === order.id}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed"
                    >
                      {acceptingId === order.id && (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}

                      {acceptingId === order.id
                        ? "Accepting..."
                        : "Accept Order"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
      </main>
    </div>
  );
}
