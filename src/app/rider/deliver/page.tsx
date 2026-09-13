"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order, OrderStatus } from "@/types";
import RiderLayout from "@/components/layout/RiderLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";

export default function RiderDeliverPage() {
  // Current active delivery order
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Page loading state
  const [isLoading, setIsLoading] = useState(true);

  // Status update loading state
  const [isUpdating, setIsUpdating] = useState(false);

  // Feedback messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load active order
  const loadActiveOrder = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.get<Order>("/orders/rider/active");

      const order = response.data;

      const activeStatuses = [
        OrderStatus.Accepted,
        OrderStatus.PickedUp,
        OrderStatus.InTransit,
      ];

      if (order && activeStatuses.includes(order.status)) {
        setActiveOrder(order);
      } else {
        setActiveOrder(null);
      }
    } catch (error: unknown) {
      setActiveOrder(null);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setErrorMessage(
            "Your login session has expired. Please login again.",
          );
        } else if (error.response?.status === 404) {
          // No active delivery is normal
          setActiveOrder(null);
        } else if (error.response?.status === 403) {
          setErrorMessage(
            "You do not have permission to view this active delivery.",
          );
        } else {
          const serverMessage = error.response?.data?.message;

          setErrorMessage(
            Array.isArray(serverMessage)
              ? serverMessage.join(", ")
              : serverMessage || "Failed to load active delivery.",
          );
        }
      } else {
        setErrorMessage("Failed to connect to server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // handle status update
  const handleStatusUpdate = async () => {
    if (!activeOrder || isUpdating) return;

    const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
      [OrderStatus.Accepted]: OrderStatus.PickedUp,
      [OrderStatus.PickedUp]: OrderStatus.InTransit,
      [OrderStatus.InTransit]: OrderStatus.Delivered,
    };

    const nextStatus = nextStatusMap[activeOrder.status];

    if (!nextStatus) return;

    setIsUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.patch(`/orders/status/${activeOrder.id}`, {
        status: nextStatus,
      });

      setActiveOrder({
        ...activeOrder,
        status: nextStatus,
      });

      setSuccessMessage(
        nextStatus === OrderStatus.Delivered
          ? "Delivery completed successfully!"
          : `Order marked as ${nextStatus.replace("_", " ")}.`,
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Failed to update order status.",
        );
      } else {
        setErrorMessage("Failed to connect to server.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!token || role?.toLowerCase() !== "rider") {
      router.push("/login");
      return;
    }
    loadActiveOrder();
  }, [router]);

  const deliverySteps = [
    {
      status: OrderStatus.Accepted,
      label: "Accepted",
      description: "Order accepted",
    },
    {
      status: OrderStatus.PickedUp,
      label: "Picked Up",
      description: "Parcel received",
    },
    {
      status: OrderStatus.InTransit,
      label: "In Transit",
      description: "On the way",
    },
    {
      status: OrderStatus.Delivered,
      label: "Delivered",
      description: "Successfully delivered",
    },
  ];

  const currentStepIndex = activeOrder
    ? deliverySteps.findIndex((step) => step.status === activeOrder.status)
    : -1;

  return (
    <RiderLayout
      currentPath="/rider/deliver"
      title="Active Delivery"
      subtitle="Track and update your current delivery order."
    >
      {isLoading && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium">Loading active delivery...</p>
        </div>
      )}

      {errorMessage && <Alert type="error" message={errorMessage} className="mt-6" />}
      {successMessage && <Alert type="success" message={successMessage} className="mt-6" />}

        {/* delivery completed */}
        {!isLoading && activeOrder?.status === OrderStatus.Delivered && (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow">
            <div className="text-5xl">✅</div>

            <h2 className="mt-4 text-2xl font-bold text-green-700">
              Delivery Completed!
            </h2>

            <p className="mt-2 text-gray-600">
              Order #{activeOrder.id} was delivered successfully.
            </p>

            <Link
              href="/rider/orders"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Find Available Orders
            </Link>
          </div>
        )}

        {!isLoading && !errorMessage && activeOrder === null && (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No Active Delivery
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You have no active deliveries right now.
            </p>

            <Link
              href="/rider/orders"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Find Available Orders
            </Link>
          </div>
        )}

        {!isLoading &&
          activeOrder &&
          activeOrder.status !== OrderStatus.Delivered && (
            <div className="mt-6 space-y-5">
              {/* Order header */}
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Delivery</p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                      Order #{activeOrder.id}
                    </h2>
                  </div>

                  <Badge variant={activeOrder.status} dot>
                    {activeOrder.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {/* update status */}
              <Button
                type="button"
                onClick={handleStatusUpdate}
                loading={isUpdating}
                variant="primary"
                className="w-full mt-6 py-3.5 text-base font-semibold"
              >
                {activeOrder.status === OrderStatus.Accepted &&
                  "Mark as Picked Up"}
                {activeOrder.status === OrderStatus.PickedUp &&
                  "Mark as In Transit"}
                {activeOrder.status === OrderStatus.InTransit &&
                  "Mark as Delivered"}
              </Button>

              {/* Delivery status stepper */}
              <div className="rounded-2xl bg-white p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Progress
                </h3>

                <div className="mt-6">
                  {deliverySteps.map((step, index) => {
                    const isCompleted = currentStepIndex > index;

                    const isCurrent = currentStepIndex === index;

                    return (
                      <div key={step.status} className="flex gap-4">
                        {/* Icon and vertical line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={[
                              "flex h-9 w-9 items-center justify-center rounded-full border-2",
                              isCompleted
                                ? "border-green-600 bg-green-600 text-white"
                                : isCurrent
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-gray-300 bg-white text-gray-400",
                            ].join(" ")}
                          >
                            {isCompleted ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m5 12 4 4L19 6" />
                              </svg>
                            ) : (
                              <span className="text-sm font-bold">
                                {index + 1}
                              </span>
                            )}
                          </div>

                          {index < deliverySteps.length - 1 && (
                            <div
                              className={[
                                "my-1 h-10 w-0.5",
                                isCompleted ? "bg-green-500" : "bg-gray-200",
                              ].join(" ")}
                            />
                          )}
                        </div>

                        {/* Step information */}
                        <div className="pb-8">
                          <p
                            className={[
                              "font-semibold",
                              isCompleted
                                ? "text-green-700"
                                : isCurrent
                                  ? "text-blue-700"
                                  : "text-gray-400",
                            ].join(" ")}
                          >
                            {step.label}

                            {isCurrent && (
                              <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs">
                                Current
                              </span>
                            )}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer information */}
              <div className="rounded-2xl bg-white p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900">
                  Customer Information
                </h3>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {activeOrder.customer?.name || "Customer"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {activeOrder.customer?.phone || "Phone not available"}
                    </p>
                  </div>

                  {activeOrder.customer?.phone && (
                    <a
                      href={`tel:${activeOrder.customer.phone}`}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      📞 Call Customer
                    </a>
                  )}
                </div>
              </div>

              {/* Location route */}
              <div className="rounded-2xl bg-white p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Route
                </h3>

                <div className="mt-5">
                  {/* Pickup */}
                  <div className="flex gap-4">
                    <div className="mt-1 h-4 w-4 shrink-0 rounded-full bg-green-500 ring-4 ring-green-100" />

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Pickup Location
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {activeOrder.pickupArea}
                      </p>

                      <p className="text-sm text-gray-500">
                        {activeOrder.pickupZone || "Zone not available"}
                      </p>
                    </div>
                  </div>

                  {/* Route line */}
                  <div className="ml-2 mt-1 h-8 border-l-2 border-dashed border-gray-300" />

                  {/* Drop-off */}
                  <div className="flex gap-4">
                    <div className="mt-1 h-4 w-4 shrink-0 rounded-full bg-red-500 ring-4 ring-red-100" />

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Drop-off Location
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {activeOrder.dropArea}
                      </p>

                      <p className="text-sm text-gray-500">
                        {activeOrder.dropZone || "Zone not available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parcel summary */}
              <div className="rounded-2xl bg-white p-6 shadow">
                <h3 className="text-lg font-bold text-gray-900">
                  Parcel Summary
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-purple-50 p-4">
                    <p className="text-xs text-gray-500">Parcel Type</p>

                    <p className="mt-1 font-semibold capitalize text-purple-700">
                      {activeOrder.parcelType}
                    </p>
                  </div>

                  <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-xs text-gray-500">Weight</p>

                    <p className="mt-1 font-semibold text-orange-700">
                      {Number(activeOrder.weight).toFixed(2)} kg
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-xs text-gray-500">Delivery Type</p>

                    <p className="mt-1 font-semibold capitalize text-blue-700">
                      {activeOrder.deliveryType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rider earning */}
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow">
                <p className="text-sm font-medium text-green-700">
                  Your Earning
                </p>

                <p className="mt-1 text-3xl font-bold text-green-700">
                  ৳{Number(activeOrder.fare).toFixed(2)}
                </p>
              </div>
            </div>
          )}
    </RiderLayout>
  );
}
