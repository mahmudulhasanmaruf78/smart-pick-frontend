"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar, { NavSection } from "@/components/layout/Sidebar";

export interface AdminSidebarProps {
  currentPath?: string;
  adminName?: string;
}

export default function AdminSidebar({
  currentPath,
  adminName: propAdminName,
}: AdminSidebarProps) {
  const { user } = useAuth();
  const [adminName, setAdminName] = useState(
    propAdminName || user?.name || "Administrator"
  );

  useEffect(() => {
    if (!propAdminName && typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) setAdminName(storedName);
    }
  }, [propAdminName, user]);

  const navSections: NavSection[] = [
    {
      title: "Core",
      items: [
        {
          name: "Dashboard Overview",
          href: "/admin",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          name: "Rider Approvals",
          href: "/admin/riders",
          badge: "Verification",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          ),
        },
        {
          name: "User Accounts",
          href: "/admin/users",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ),
        },
        {
          name: "Delivery Zones",
          href: "/admin/zones",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
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

  const systemStatusWidget = (
    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Online
        </span>
        <span className="text-[10px] uppercase font-bold text-slate-400">v1.2</span>
      </div>
    </div>
  );

  return (
    <Sidebar
      currentPath={currentPath}
      brand={{
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        iconBgGradient: "from-amber-500 to-indigo-600",
        subtitle: "Admin Console",
        href: "/admin",
        highlightColor: "text-amber-400",
      }}
      user={{
        name: adminName,
        avatarBg: "bg-amber-500/15 border border-amber-500/30 text-amber-400",
        statusBadge: (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Super Admin
          </span>
        ),
      }}
      navSections={navSections}
      middleWidget={systemStatusWidget}
      activeItemClass="bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
      hoverItemClass="group-hover:text-amber-400"
    />
  );
}
