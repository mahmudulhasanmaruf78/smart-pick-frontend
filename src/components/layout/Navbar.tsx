"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { token, logout } = useAuth();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4 px-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          SmartPick
        </Link>

        <div className="flex items-center space-x-4 text-sm">
          {token ? (
            <>
              <Link
                href="/create-order"
                className="bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700 transition"
              >
                + Book Parcel
              </Link>
              <Link
                href="/orders"
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                My Orders
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 font-medium transition cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-50 transition"
              >
                Customer Sign Up
              </Link>
              <Link
                href="/rider/register"
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-700 transition"
              >
                Rider Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}