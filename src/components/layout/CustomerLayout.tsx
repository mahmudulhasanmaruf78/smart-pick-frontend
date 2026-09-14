"use client";

import React from "react";
import CustomerSidebar from "@/components/layout/CustomerSidebar";

interface CustomerLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  userName?: string;
  maxWidth?: string;
}

// Reusable Customer Portal Layout
export default function CustomerLayout({
  children,
  currentPath,
  userName,
  maxWidth = "max-w-4xl",
}: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Persistent Left Sidebar */}
      <CustomerSidebar currentPath={currentPath} userName={userName} />

      {/* Dynamic Right Content Area */}
      <main className="flex-1 md:ml-64 min-w-0 px-4 py-8 sm:px-8 lg:px-10">
        <div className={`mx-auto ${maxWidth}`}>{children}</div>
      </main>
    </div>
  );
}
