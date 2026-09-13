"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { VerificationStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  name: string;
  href: string;
  badge?: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

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
  const { logout } = useAuth();
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
    logout(true);
  };

  const navSections: NavSection[] = [
    {
      title: "Delivery Jobs",
      items: [
        {
          name: "Available Orders",
          href: "/rider/orders",
          badge: "Live",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          ),
        },
        {
          name: "Active Delivery",
          href: "/rider/deliver",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Consignments",
      items: [
        {
          name: "My Consignments",
          href: "/orders",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          name: "My Profile",
          href: "/profile",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ),
        },
      ],
    },
  ];

  const getStatusBadge = () => {
    if (verificationStatus === VerificationStatus.Approved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Verified Rider
        </span>
      );
    }
    if (verificationStatus === VerificationStatus.Pending) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Pending Approval
        </span>
      );
    }
    if (verificationStatus === VerificationStatus.Rejected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
        🚴 Active Rider
      </span>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <button
          type="button"
          onClick={handleLogoClick}
          title="Click to refresh"
          className="flex items-center gap-3 text-left group transition-all hover:opacity-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            🚴
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Smart<span className="text-blue-400">Pick</span>
              </span>
              <svg
                className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:rotate-180 transition-all duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Rider Portal
            </span>
          </div>
        </button>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Rider Profile Mini Card */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">
            {riderName ? riderName.charAt(0).toUpperCase() : "R"}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-white truncate">
              {riderName}
            </h4>
            <div className="mt-1">{getStatusBadge()}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive =
                activePath === item.href ||
                (item.href === "/profile" && activePath === "/rider/profile");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400 transition-colors"}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-blue-400 border border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Quick Tip Widget */}
      <div className="p-3.5 mx-3 mb-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
          <span>💡 Quick Tip</span>
        </div>
        <p className="text-[11px] text-slate-300/90 leading-relaxed">
          Accept nearby delivery jobs along your route to maximize earnings!
        </p>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header with Hamburger */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-300 hover:bg-slate-800"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleLogoClick}
            className="font-bold text-white text-left hover:text-blue-400 transition flex items-center gap-2 cursor-pointer"
          >
            <span>🚴</span>
            <span>
              Smart<span className="text-blue-400">Pick</span> Rider
            </span>
          </button>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
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
