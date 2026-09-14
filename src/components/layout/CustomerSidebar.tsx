"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar, { NavSection } from "@/components/layout/Sidebar";

export interface CustomerSidebarProps {
  currentPath?: string;
  userName?: string;
}

export default function CustomerSidebar({
  currentPath,
  userName: propUserName,
}: CustomerSidebarProps) {
  const { user } = useAuth();
  const [userName, setUserName] = useState(
    propUserName || user?.name || "Customer"
  );

  useEffect(() => {
    if (!propUserName && typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) setUserName(storedName);
    }
  }, [propUserName, user]);

  const navSections: NavSection[] = [
    {
      title: "Orders",
      items: [
        {
          name: "My Orders",
          href: "/orders",
          badge: "Active",
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
          name: "Book New Parcel",
          href: "/create-order",
          badge: "+ New",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
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

  const quickTipWidget = (
    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
      <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
        <span> Quick Tip</span>
      </div>
      <p className="text-[11px] text-slate-300/90 leading-relaxed">
        Book consignments easily and track handovers live every step of the way!
      </p>
    </div>
  );

  return (
    <Sidebar
      currentPath={currentPath}
      brand={{
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
        iconBgGradient: "from-blue-600 to-indigo-500",
        subtitle: "Customer Portal",
        href: "/orders",
        highlightColor: "text-blue-400",
      }}
      user={{
        name: userName,
        avatarBg: "bg-blue-500/15 border border-blue-500/30 text-blue-400",
        statusBadge: (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Customer
          </span>
        ),
      }}
      navSections={navSections}
      middleWidget={quickTipWidget}
      activeItemClass="bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
      hoverItemClass="group-hover:text-blue-400"
    />
  );
}
