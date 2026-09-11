"use client";

import axios from "axios";
import Link from "next/link";
import { api } from "@/lib/api";
import { Role, User } from "@/types";
import { useEffect, useMemo, useState } from "react";

export default function AdminUsersPage() {
  // Current logged in Admin Profile State
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);

  // Full Users List State
  const [users, setUsers] = useState<User[]>([]);

  // Search & Role Filter State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  // Page Loading & Feedback Message State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Confirmation Modal State
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
  const [isSuspending, setIsSuspending] = useState<boolean>(false);

  // User list and Current Admin Profile Fetching Function
  const fetchUsersAndProfile = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Promise.all Using for Parallel Calling
      const [profileResponse, usersResponse] = await Promise.all([
        api.get<User>("/users/profile"),
        api.get<User[]>("/admin/users"),
      ]);

      setCurrentAdmin(profileResponse.data);
      setUsers(usersResponse.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Failed to load users data.",
        );
      } else {
        setErrorMessage("Failed to connect to server.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Suspend confirm button handler
  const handleConfirmSuspend = async () => {
    if (!userToSuspend) return;

    setIsSuspending(true);
    setErrorMessage("");
    setSuccessMessage("");

    const targetUserId = userToSuspend.id;
    const targetUserName = userToSuspend.name;

    try {
      // Backend PATCH request sending
      await api.patch(`/admin/users/suspend/${targetUserId}`);

      // Update local users state for this user isActive: false (table updates without reload)
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === targetUserId) {
            return {
              ...user,
              isActive: false,
            };
          }
          return user;
        }),
      );

      // Success message set
      setSuccessMessage(
        `User ${targetUserName} has been suspended successfully.`,
      );

      // Confirmation modal close
      setUserToSuspend(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message || `Failed to suspend user ${targetUserName}.`,
        );
      } else {
        setErrorMessage("Failed to connect to server. Please try again.");
      }
    } finally {
      setIsSuspending(false);
    }
  };

  // Page Load Time Fetching
  useEffect(() => {
    fetchUsersAndProfile();
  }, []);

  // Real-time Search & Role Filtered List
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Role Matching
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Search Term Matching (Name, Email or Phone)
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchTerm]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* 1. Back to Dashboard Link */}
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* 2. Header Section */}
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              User Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Inspect user accounts, filter by roles, and suspend abusive users.
            </p>
          </div>

          {/* Showing X of Y total users counter */}
          <div className="self-start rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs sm:self-auto">
            Showing{" "}
            <span className="text-blue-600 font-bold">
              {filteredUsers.length}
            </span>{" "}
            of <span className="font-bold">{users.length}</span> total users
          </div>
        </div>

        {/* 3. Search & Role Filter Control Bar */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search box */}
          <div className="relative w-full sm:max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 shadow-2xs transition focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
            {/* Clear Button */}
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Role filter pills (All / Customers / Riders / Admins) */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1 shadow-2xs">
            {/* All Roles */}
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              All Roles
            </button>

            {/* Customers */}
            <button
              type="button"
              onClick={() => setRoleFilter(Role.Customer)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === Role.Customer
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Customers
            </button>

            {/* Riders */}
            <button
              type="button"
              onClick={() => setRoleFilter(Role.Rider)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === Role.Rider
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Riders
            </button>

            {/* Admins */}
            <button
              type="button"
              onClick={() => setRoleFilter(Role.Admin)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === Role.Admin
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Admins
            </button>
          </div>
        </div>
        {/* Success Alert */}
        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm"
          >
            {successMessage}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 shadow-sm"
          >
            {errorMessage}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="mt-8 flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <span className="ml-3 text-base font-medium text-gray-600">
              Loading users data...
            </span>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty State */
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              👥
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? `No user matched your search "${searchTerm}".`
                : "No users exist under the selected role filter."}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="mt-4 inline-flex items-center rounded-lg bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          /* Users Data Table */
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      User Info
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Joined Date
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white text-sm">
                  {filteredUsers.map((user) => {
                    const isSuspended = !user.isActive;
                    const isSelf = user.id === currentAdmin?.id;
                    const isAdmin = user.role === Role.Admin;

                    return (
                      <tr
                        key={user.id}
                        className={`transition ${
                          isSuspended
                            ? "bg-gray-50/70 opacity-60"
                            : "hover:bg-gray-50/80"
                        }`}
                      >
                        {/* 1. User Info (Avatar + Name + Email + Phone) */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                                user.role === Role.Admin
                                  ? "bg-amber-100 text-amber-700"
                                  : user.role === Role.Rider
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900">
                                  {user.name}
                                </p>
                                {isSelf && (
                                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                              <p className="text-xs font-medium text-gray-600">
                                {user.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role Badge */}
                        <td className="whitespace-nowrap px-6 py-4">
                          {user.role === Role.Customer && (
                            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              🛍️ Customer
                            </span>
                          )}
                          {user.role === Role.Rider && (
                            <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                              🚴 Rider
                            </span>
                          )}
                          {user.role === Role.Admin && (
                            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                              🛡️ Admin
                            </span>
                          )}
                        </td>

                        {/* 3. Joined Date */}
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>

                        {/* 4. Status Badge */}
                        <td className="whitespace-nowrap px-6 py-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                              Suspended
                            </span>
                          )}
                        </td>

                        {/* 5. Actions (Suspend Button) */}
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          {isSelf || isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                              🔒 Protected
                            </span>
                          ) : isSuspended ? (
                            <span className="text-xs italic text-gray-400">
                              Suspended
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setUserToSuspend(user)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs transition hover:bg-rose-50 hover:border-rose-300"
                            >
                              <span>Suspend</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suspend Confirmation Modal */}
        {userToSuspend && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            onClick={() => !isSuspending && setUserToSuspend(null)} // ব্যাকড্রপ ক্লিকে বন্ধ হবে
          >
            <div
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-7"
              onClick={(e) => e.stopPropagation()} // মডালের ভেতরে ক্লিকে বন্ধ হবে না
            >
              {/* Warning Icon & Title */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-2xl text-rose-600 shadow-2xs">
                  ⚠️
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Suspend User Account?
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    Are you sure you want to suspend{" "}
                    <span className="font-bold text-gray-900">
                      {userToSuspend.name}
                    </span>
                    ? This user will immediately be logged out and blocked from
                    accessing SmartPick.
                  </p>
                </div>
              </div>

              {/* Selected User Info Mini Card */}
              <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Email:</span>
                  <span className="font-semibold text-gray-800">
                    {userToSuspend.email}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-medium text-gray-500">Role:</span>
                  <span className="font-bold uppercase text-gray-700">
                    {userToSuspend.role}
                  </span>
                </div>
              </div>

              {/* Modal Action Buttons (Cancel / Yes, Suspend) */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => setUserToSuspend(null)}
                  disabled={isSuspending}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                {/* Confirm Suspend Button */}
                <button
                  type="button"
                  onClick={handleConfirmSuspend}
                  disabled={isSuspending}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSuspending && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>{isSuspending ? "Suspending..." : "Yes, Suspend"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
