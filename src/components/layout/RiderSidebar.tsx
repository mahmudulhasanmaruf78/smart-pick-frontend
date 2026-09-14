"use client";

import { useState, useEffect } from "react";
import { VerificationStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import Sidebar, { NavSection } from "@/components/layout/Sidebar";

export interface RiderSidebarProps {
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
  const { user } = useAuth();
  const [riderName, setRiderName] = useState(
    propRiderName || user?.name || "Rider",
  );

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
  }, [propRiderName, user]);

  const navSections: NavSection[] = [
    {
      title: "Delivery Jobs",
      items: [
        {
          name: "Available Orders",
          href: "/rider/orders",
          badge: "Live",
          icon: (
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          ),
        },
        {
          name: "Active Delivery",
          href: "/rider/deliver",
          icon: (
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          ),
        },
        {
          name: "Delivery History",
          href: "/rider/history",
          icon: (
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
        Active Rider
      </span>
    );
  };

  const quickTipWidget = (
    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
      <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
        <span> Quick Tip</span>
      </div>
      <p className="text-[11px] text-slate-300/90 leading-relaxed">
        Accept nearby delivery jobs along your route to maximize earnings!
      </p>
    </div>
  );

  return (
    <Sidebar
      currentPath={currentPath}
      brand={{
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        iconBgGradient: "from-blue-600 to-cyan-500",
        subtitle: "Rider Command Center",
        onLogoClick: handleLogoClick,
        highlightColor: "text-cyan-400",
      }}
      user={{
        name: riderName,
        avatarBg: "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400",
        statusBadge: getStatusBadge(),
      }}
      navSections={navSections}
      middleWidget={quickTipWidget}
      activeItemClass="bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
      hoverItemClass="group-hover:text-cyan-400"
    />
  );
}
