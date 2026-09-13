"use client";

import React, { useEffect } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  size,
  className = "",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[size || maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidthClasses} bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-10 animate-scaleUp ${className}`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">{children}</div>

        {/* Action Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
