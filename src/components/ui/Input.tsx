"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = "",
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        disabled={disabled}
        className={`w-full border p-2 rounded text-black transition focus:outline-blue-500 ${
          disabled
            ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
            : "border-gray-300 bg-white"
        } ${error ? "border-red-500 focus:outline-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400">{helperText}</p>}
    </div>
  );
}