"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  isLoading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isBusy = isLoading || loading;
  const baseStyles = "font-semibold rounded transition cursor-pointer inline-flex items-center justify-center";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  };

  return (
    <button
      disabled={disabled || isBusy}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isBusy ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}