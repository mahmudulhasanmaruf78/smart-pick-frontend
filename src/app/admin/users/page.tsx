"use client";

import axios from "axios";
import { api } from "@/lib/api";
import { Role, User } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";

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

  // Confirmation Modal States
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
  const [isSuspending, setIsSuspending] = useState<boolean>(false);

  const [userToUnsuspend, setUserToUnsuspend] = useState<User | null>(null);
  const [isUnsuspending, setIsUnsuspending] = useState<boolean>(false);

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // User list and Current Admin Profile Fetching Function
  const fetchUsersAndProfile = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
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
      await api.patch(`/admin/users/suspend/${targetUserId}`);

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

      setSuccessMessage(
        `User ${targetUserName} has been suspended successfully.`,
      );
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

  // Unsuspend confirm button handler
  const handleConfirmUnsuspend = async () => {
    if (!userToUnsuspend) return;

    setIsUnsuspending(true);
    setErrorMessage("");
    setSuccessMessage("");

    const targetUserId = userToUnsuspend.id;
    const targetUserName = userToUnsuspend.name;

    try {
      await api.patch(`/admin/users/unsuspend/${targetUserId}`);

      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === targetUserId) {
            return {
              ...user,
              isActive: true,
            };
          }
          return user;
        }),
      );

      setSuccessMessage(
        `User ${targetUserName} has been reactivated successfully.`,
      );
      setUserToUnsuspend(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message || `Failed to unsuspend user ${targetUserName}.`,
        );
      } else {
        setErrorMessage("Failed to connect to server. Please try again.");
      }
    } finally {
      setIsUnsuspending(false);
    }
  };

  // Delete confirm button handler
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const targetUserId = userToDelete.id;
    const targetUserName = userToDelete.name;

    try {
      await api.delete(`/admin/users/${targetUserId}`);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== targetUserId),
      );

      setSuccessMessage(
        `User ${targetUserName} (#${targetUserId}) has been permanently deleted.`,
      );
      setUserToDelete(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message || `Failed to delete user ${targetUserName}.`,
        );
      } else {
        setErrorMessage("Failed to connect to server. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role =
      typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!token || role?.toLowerCase() !== "admin") {
      router.push("/login");
      return;
    }
    fetchUsersAndProfile();
  }, [router]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
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
    <AdminLayout
      title="User Management"
      subtitle="Inspect user accounts, filter by roles, and suspend abusive users."
      currentPath="/admin/users"
      backHref="/admin"
      actions={
        <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs">
          Showing{" "}
          <span className="text-blue-600 font-bold">
            {filteredUsers.length}
          </span>{" "}
          of <span className="font-bold">{users.length}</span> total users
        </div>
      }
    >
      {/* Search & Role Filter Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
            ></button>
          )}
        </div>

        {/* Role filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1 shadow-2xs">
          {(["all", Role.Customer, Role.Rider, Role.Admin] as const).map(
            (r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition capitalize ${
                  roleFilter === r
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {r === "all" ? "All Roles" : `${r}s`}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="mt-6">
          <Alert variant="success" onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        </div>
      )}

      {errorMessage && (
        <div className="mt-6">
          <Alert variant="error" onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl"></div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">
            No users found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? `No user matched your search "${searchTerm}".`
              : "No users exist under the selected role filter."}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="mt-4"
            >
              Clear Search Filter
            </Button>
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
                      {/* 1. User Info */}
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
                        <Badge variant={user.role}>
                          {user.role === Role.Customer && " Customer"}
                          {user.role === Role.Rider && " Rider"}
                          {user.role === Role.Admin && " Admin"}
                        </Badge>
                      </td>

                      {/* 3. Joined Date */}
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* 4. Status Badge */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge
                          variant={user.isActive ? "active" : "suspended"}
                          withDot
                        >
                          {user.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </td>

                      {/* 5. Actions (Suspend, Unsuspend, Delete) */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        {isSelf || isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                            Protected
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {isSuspended ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-600! text-emerald-700! hover:bg-emerald-50!"
                                onClick={() => setUserToUnsuspend(user)}
                              >
                                Unsuspend
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-amber-500! text-amber-700! hover:bg-amber-50!"
                                onClick={() => setUserToSuspend(user)}
                              >
                                Suspend
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setUserToDelete(user)}
                            >
                              Delete
                            </Button>
                          </div>
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
      <Modal
        isOpen={!!userToSuspend}
        onClose={() => !isSuspending && setUserToSuspend(null)}
        title="Suspend User Account?"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setUserToSuspend(null)}
              disabled={isSuspending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmSuspend}
              isLoading={isSuspending}
            >
              Yes, Suspend
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-2xs">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to suspend{" "}
                <span className="font-bold text-gray-900">
                  {userToSuspend?.name}
                </span>
                ? This user will immediately be logged out and blocked from
                accessing SmartPick.
              </p>
            </div>
          </div>

          {userToSuspend && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Email:</span>
                <span className="font-semibold text-gray-800">
                  {userToSuspend.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Role:</span>
                <Badge variant={userToSuspend.role}>{userToSuspend.role}</Badge>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Unsuspend Confirmation Modal */}
      <Modal
        isOpen={!!userToUnsuspend}
        onClose={() => !isUnsuspending && setUserToUnsuspend(null)}
        title="Unsuspend User Account?"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setUserToUnsuspend(null)}
              disabled={isUnsuspending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="bg-emerald-600! hover:bg-emerald-700!"
              onClick={handleConfirmUnsuspend}
              isLoading={isUnsuspending}
            >
              Yes, Unsuspend
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-2xs">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to reactivate{" "}
                <span className="font-bold text-gray-900">
                  {userToUnsuspend?.name}
                </span>
                ? This user will regain access to their account and services on
                SmartPick.
              </p>
            </div>
          </div>

          {userToUnsuspend && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Email:</span>
                <span className="font-semibold text-gray-800">
                  {userToUnsuspend.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Role:</span>
                <Badge variant={userToUnsuspend.role}>
                  {userToUnsuspend.role}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Hard Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => !isDeleting && setUserToDelete(null)}
        title="Permanently Delete User?"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Permanently Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-2xs">
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-gray-900">
                  {userToDelete?.name}
                </span>
                ?
              </p>
              <p className="mt-2 text-xs font-semibold text-rose-600">
                Warning: This action cannot be undone. All profile data,
                verification records, and associated user information will be
                permanently purged from the database.
              </p>
            </div>
          </div>

          {userToDelete && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">User ID:</span>
                <span className="font-mono font-semibold text-gray-800">
                  #{userToDelete.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Email:</span>
                <span className="font-semibold text-gray-800">
                  {userToDelete.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Role:</span>
                <Badge variant={userToDelete.role}>{userToDelete.role}</Badge>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
}
