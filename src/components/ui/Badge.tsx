import React from "react";

export interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className = "" }: BadgeProps) {
  const getColors = (st: string) => {
    switch (st.toLowerCase()) {
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
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold uppercase ${getColors(
        status,
      )} ${className}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}