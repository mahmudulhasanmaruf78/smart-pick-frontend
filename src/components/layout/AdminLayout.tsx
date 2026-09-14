"use client";

import React from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  currentPath?: string;
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
  currentPath,
  backHref,
  backLabel = "Back to Overview",
  action,
  actions,
  maxWidth = "max-w-7xl",
}: AdminLayoutProps) {
  const headerActions = actions || action;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Persistent Left Admin Command Sidebar */}
      <AdminSidebar currentPath={currentPath} />

      {/* Dynamic Right Content Area */}
      <main className="flex-1 md:ml-64 min-w-0 px-4 py-8 sm:px-8 lg:px-10">
        <div className={`mx-auto ${maxWidth}`}>
          {/* Top Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 mb-8">
            <div>
              {backHref && (
                <div className="mb-2">
                  <Link
                    href={backHref}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    &larr; {backLabel}
                  </Link>
                </div>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-3">{headerActions}</div>
            )}
          </div>

          {/* Body Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
