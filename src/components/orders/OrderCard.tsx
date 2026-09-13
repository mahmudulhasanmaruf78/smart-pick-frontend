"use client";

import React from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export interface Order {
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

export interface OrderCardProps {
  order: Order;
  onCancel?: (orderId: number) => void;
}

export default function OrderCard({ order, onCancel }: OrderCardProps) {
  const canCancel =
    order.status.toLowerCase() === "pending" ||
    order.status.toLowerCase() === "accepted";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="font-bold text-base text-gray-900">
            Order #{order.id}
          </span>
          <Badge status={order.status} />
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
            <span className="text-blue-600 font-medium">
              Rider: {order.rider.name} ({order.rider.phone})
            </span>
          )}
        </div>
      </div>

      <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0">
        <div className="text-right">
          <span className="text-xs text-gray-500 block">Delivery Charge</span>
          <span className="text-xl font-bold text-blue-600">
            {order.fare} BDT
          </span>
        </div>

        {canCancel && onCancel && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => onCancel(order.id)}
            className="text-xs"
          >
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}