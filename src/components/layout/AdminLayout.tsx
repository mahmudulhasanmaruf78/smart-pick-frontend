"use client";

import React from "react";
import Link from "next/link";

export interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

export default function AdminLayout({
  children,
  title,
  subtitle,
  backHref,
  backLabel = "Back to Dashboard",
  action,
  actions,
  maxWidth = "max-w-7xl",
}: AdminLayoutProps) {
  const headerActions = actions || action;
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className={`mx-auto ${maxWidth}`}>
        {/* Back Link */}
        {backHref && (
          <div className="mb-4">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              &larr; {backLabel}
            </Link>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
        </div>

        {/* Body Content */}
        {children}
      </div>
    </main>
  );
}
