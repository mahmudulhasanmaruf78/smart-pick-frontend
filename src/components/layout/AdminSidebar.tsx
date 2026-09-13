"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";

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

interface AdminSidebarProps {
  currentPath?: string;
  adminName?: string;
}

export default function AdminSidebar({
  currentPath,
  adminName: propAdminName,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const activePath = currentPath || pathname;
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [adminName, setAdminName] = useState(
    propAdminName || user?.name || "Administrator"
  );

  useEffect(() => {
    if (!propAdminName && typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) setAdminName(storedName);
    }
  }, [propAdminName, user]);

  const handleLogout = () => {
    logout(true);
  };

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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Smart<span className="text-amber-400">Pick</span>
              </span>
            </div>
            <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Admin Console
            </span>
          </div>
        </Link>

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

      {/* Admin Profile Mini Card */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
            {adminName ? adminName.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-white truncate">
              {adminName}
            </h4>
            <div className="mt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Super Admin
              </span>
            </div>
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
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-amber-400 transition-colors"}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
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

      {/* System Status Pill Widget */}
      <div className="p-3.5 mx-3 mb-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
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
          <Link
            href="/admin"
            className="font-bold text-white text-left hover:text-amber-400 transition flex items-center gap-2"
          >
            <span>🛡️</span>
            <span>
              Smart<span className="text-amber-400">Pick</span> Admin
            </span>
          </Link>
        </div>
        <Badge variant="admin" size="sm">
          Admin
        </Badge>
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
