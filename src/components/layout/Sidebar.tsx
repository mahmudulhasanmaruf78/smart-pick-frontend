"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export interface NavItem {
  name: string;
  href: string;
  badge?: string;
  icon: React.ReactNode;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface SidebarBrand {
  name?: string;
  highlightText?: string;
  highlightColor?: string;
  subtitle: string;
  href?: string;
  icon: React.ReactNode;
  iconBgGradient?: string;
  onLogoClick?: (e: React.MouseEvent) => void;
}

export interface SidebarUser {
  name: string;
  avatarLetter?: string;
  avatarBg?: string;
  statusBadge?: React.ReactNode;
}

export interface SidebarProps {
  currentPath?: string;
  brand: SidebarBrand;
  user: SidebarUser;
  navSections: NavSection[];
  middleWidget?: React.ReactNode;
  activeItemClass?: string;
  hoverItemClass?: string;
  onLogout?: () => void;
}

export default function Sidebar({
  currentPath,
  brand,
  user,
  navSections,
  middleWidget,
  activeItemClass = "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold",
  hoverItemClass = "group-hover:text-blue-400",
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const activePath = currentPath || pathname;
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout(true);
    }
  };

  const avatarInitial =
    user.avatarLetter || (user.name ? user.name.charAt(0).toUpperCase() : "U");
  const highlightColor = brand.highlightColor || "text-blue-400";
  const iconGradient = brand.iconBgGradient || "from-blue-600 to-indigo-500";

  const brandElement = brand.onLogoClick ? (
    <button
      type="button"
      onClick={brand.onLogoClick}
      title="Click to refresh"
      className="flex items-center gap-3 text-left group transition-all hover:opacity-95 cursor-pointer"
    >
      <div
        className={`w-10 h-10 rounded-xl bg-linear-to-tr ${iconGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform`}
      >
        {brand.icon}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
            {brand.name || "Smart"}
            <span className={highlightColor}>
              {brand.highlightText || "Pick"}
            </span>
          </span>
        </div>
        <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          {brand.subtitle}
        </span>
      </div>
    </button>
  ) : (
    <Link href={brand.href || "/"} className="flex items-center gap-3 group">
      <div
        className={`w-10 h-10 rounded-xl bg-linear-to-tr ${iconGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform`}
      >
        {brand.icon}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-lg font-bold tracking-tight text-white group-hover:${highlightColor} transition-colors`}
          >
            {brand.name || "Smart"}
            <span className={highlightColor}>
              {brand.highlightText || "Pick"}
            </span>
          </span>
        </div>
        <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          {brand.subtitle}
        </span>
      </div>
    </Link>
  );

  const mobileBrandElement = brand.onLogoClick ? (
    <button
      type="button"
      onClick={brand.onLogoClick}
      className="font-bold text-white text-left hover:text-blue-400 transition flex items-center gap-2 cursor-pointer"
    >
      <span>{brand.icon}</span>
      <span>
        {brand.name || "Smart"}
        <span className={highlightColor}>{brand.highlightText || "Pick"}</span>
      </span>
    </button>
  ) : (
    <Link
      href={brand.href || "/"}
      className="font-bold text-white text-left hover:text-blue-400 transition flex items-center gap-2"
    >
      <span>{brand.icon}</span>
      <span>
        {brand.name || "Smart"}
        <span className={highlightColor}>{brand.highlightText || "Pick"}</span>
      </span>
    </Link>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
        {brandElement}

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          aria-label="Close menu"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* User Profile Mini Card */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              user.avatarBg ||
              "bg-blue-500/15 border border-blue-500/30 text-blue-400"
            }`}
          >
            {avatarInitial}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-white truncate">
              {user.name}
            </h4>
            {user.statusBadge && (
              <div className="mt-0.5">{user.statusBadge}</div>
            )}
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
                      ? activeItemClass
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        isActive
                          ? "text-white"
                          : `text-slate-400 ${hoverItemClass} transition-colors`
                      }
                    >
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

      {/* Middle Widget (Optional) */}
      {middleWidget && <div className="px-3 pb-3">{middleWidget}</div>}

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
        >
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
            className="p-2 -ml-2 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {mobileBrandElement}
        </div>
        {user.statusBadge && <div>{user.statusBadge}</div>}
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
