import React from "react";

export interface AlertProps {
  type?: "error" | "success" | "warning" | "info";
  variant?: "error" | "success" | "warning" | "info";
  title?: string;
  message?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Alert({
  type,
  variant,
  title,
  message,
  children,
  onClose,
  className = "",
}: AlertProps) {
  if (!message && !children && !title) return null;

  const alertType = variant || type || "info";

  const getStyle = () => {
    switch (alertType) {
      case "error":
        return {
          wrapper: "bg-rose-50 border-rose-200 text-rose-800",
          iconColor: "text-rose-500",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
        };
      case "success":
        return {
          wrapper: "bg-emerald-50 border-emerald-200 text-emerald-800",
          iconColor: "text-emerald-500",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
        };
      case "warning":
        return {
          wrapper: "bg-amber-50 border-amber-200 text-amber-800",
          iconColor: "text-amber-500",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          ),
        };
      case "info":
      default:
        return {
          wrapper: "bg-blue-50 border-blue-200 text-blue-800",
          iconColor: "text-blue-500",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
        };
    }
  };

  const style = getStyle();

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm transition-all shadow-xs ${style.wrapper} ${className}`}
    >
      <svg
        className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {style.icon}
      </svg>

      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-sm mb-0.5">{title}</h4>}
        {message && <p className="leading-relaxed">{message}</p>}
        {children}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-black/5 transition shrink-0"
          aria-label="Dismiss alert"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
