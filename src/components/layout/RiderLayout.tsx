"use client";

import React from "react";
import RiderSidebar from "@/components/layout/RiderSidebar";
import { VerificationStatus } from "@/types";

interface RiderLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  title?: string;
  subtitle?: string;
  verificationStatus?: VerificationStatus | null;
  riderName?: string;
  onRefresh?: () => void;
  maxWidth?: string;
  action?: React.ReactNode;
}

// Reusable Rider Portal Layout
export default function RiderLayout({
  children,
  currentPath,
  title,
  subtitle,
  verificationStatus,
  riderName,
  onRefresh,
  maxWidth = "max-w-4xl",
  action,
}: RiderLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Persistent Left Sidebar */}
      <RiderSidebar
        currentPath={currentPath}
        verificationStatus={verificationStatus}
        riderName={riderName}
        onRefresh={onRefresh}
      />

      {/* Dynamic Right Content Area */}
      <main className="flex-1 md:ml-64 min-w-0 px-4 py-8 sm:px-8 lg:px-10">
        <div className={`mx-auto ${maxWidth}`}>
          {/* Optional Page Header */}
          {(title || action) && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
              {action && <div>{action}</div>}
            </div>
          )}

          {/* Main Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
