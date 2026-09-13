import React from "react";

export interface BadgeProps {
  status?: string;
  variant?:
    | "pending"
    | "accepted"
    | "picked_up"
    | "in_transit"
    | "delivered"
    | "cancelled"
    | "approved"
    | "rejected"
    | "active"
    | "suspended"
    | "customer"
    | "rider"
    | "admin"
    | "document"
    | "parcel"
    | "fragile"
    | "regular"
    | "express"
    | (string & {});
  dot?: boolean;
  withDot?: boolean;
  size?: "sm" | "md";
  className?: string;
  children?: React.ReactNode;
}

export default function Badge({
  status,
  variant,
  dot = false,
  withDot,
  size = "md",
  className = "",
  children,
}: BadgeProps) {
  const showDot = withDot !== undefined ? withDot : dot;
  const key = (variant || status || "default").toLowerCase().replace(/[\s-]/g, "_");

  const getStyle = () => {
    switch (key) {
      case "pending":
        return {
          wrapper: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      case "accepted":
      case "picked_up":
      case "in_transit":
        return {
          wrapper: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };
      case "delivered":
      case "approved":
      case "active":
        return {
          wrapper: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "cancelled":
      case "rejected":
      case "suspended":
        return {
          wrapper: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
        };
      case "customer":
        return {
          wrapper: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-500",
        };
      case "rider":
        return {
          wrapper: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };
      case "admin":
        return {
          wrapper: "bg-indigo-50 text-indigo-700 border-indigo-200",
          dot: "bg-indigo-500",
        };
      default:
        return {
          wrapper: "bg-gray-100 text-gray-700 border-gray-200",
          dot: "bg-gray-400",
        };
    }
  };

  const style = getStyle();
  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5"
      : "text-xs px-2.5 py-0.5";

  const displayContent = children ?? (status ? status.replace(/_/g, " ") : key);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide uppercase ${sizeClasses} ${style.wrapper} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${style.dot} ${
            key === "pending" || key === "in_transit" ? "animate-pulse" : ""
          }`}
        />
      )}
      {displayContent}
    </span>
  );
}