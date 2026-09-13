"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { VerificationStatus } from "@/types";

interface RiderSidebarProps {
  currentPath?: string;
  verificationStatus?: VerificationStatus | null;
  riderName?: string;
  onRefresh?: () => void;
}

export default function RiderSidebar({
  currentPath,
  verificationStatus,
  riderName: propRiderName,
  onRefresh,
}: RiderSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activePath = currentPath || pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [riderName, setRiderName] = useState(propRiderName || "Rider");

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onRefresh) {
      onRefresh();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (!propRiderName && typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) setRiderName(storedName);
    }
  }, [propRiderName]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      router.push("/login");
    }
  };

  const navLinks = [
    {
      name: "Available Orders",
      href: "/rider/orders",
      badge: "Live",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: "Active Delivery",
      href: "/rider/deliver",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: "My Profile",
      href: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: "SmartPick Home",
      href: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
  ];

  const getStatusBadge = () => {
    if (verificationStatus === VerificationStatus.Approved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Verified Rider
        </span>
      );
    }
    if (verificationStatus === VerificationStatus.Pending) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Pending Approval
        </span>
      );
    }
    if (verificationStatus === VerificationStatus.Rejected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Rider Portal
      </span>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={handleLogoClick}
          title="Click to refresh"
          className="flex items-center gap-2.5 text-left group transition-all hover:opacity-90 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 group-active:scale-95 transition-transform">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                Smart<span className="text-blue-600">Pick</span>
              </span>
              <svg
                className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 group-hover:rotate-180 transition-all duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="block text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              Rider Portal
            </span>
          </div>
        </button>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Rider Status Card */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
            🚴
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {riderName}
            </p>
            <div className="mt-1">{getStatusBadge()}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Navigation
        </p>
        {navLinks.map((item) => {
          const isActive =
            activePath === item.href ||
            (item.href === "/profile" && activePath === "/rider/profile");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600"}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Helpful Info Widget */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-blue-50/70 border border-blue-100">
        <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
          <span>💡 Quick Tip</span>
        </div>
        <p className="mt-1 text-xs text-blue-900/80 leading-relaxed">
          Accept orders quickly to boost your delivery rating and maximize earnings!
        </p>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header with Hamburger */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleLogoClick}
            title="Click to refresh"
            className="font-bold text-gray-900 text-left hover:text-blue-600 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>
              Smart<span className="text-blue-600">Pick</span> Rider
            </span>
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        {sidebarContent}
      </aside>
    </>
  );
}
