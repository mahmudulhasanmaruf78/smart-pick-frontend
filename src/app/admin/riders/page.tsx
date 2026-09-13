"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, VerificationStatus } from "@/types";
import AdminLayout from "@/components/layout/AdminLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";

export default function AdminRidersPage() {
  // Rider list State
  const [riders, setRiders] = useState<User[]>([]);

  // Filter Tab State
  const [activeTab, setActiveTab] = useState<VerificationStatus | "all">(
    VerificationStatus.Pending,
  );

  // Loading & Processing State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Feedback message State
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // NID Image Preview Modal State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch all riders
  const fetchRiders = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<User[]>("/admin/riders");
      setRiders(response.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Failed to load riders list.",
        );
      } else {
        setErrorMessage("Failed to connect to server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!token || role?.toLowerCase() !== "admin") {
      router.push("/login");
      return;
    }
    fetchRiders();
  }, [router]);

  // NID Image full path generate helper function
  const getNidImageUrl = (path?: string) => {
    if (!path) return "";
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:")
    ) {
      return path;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:3000";
    const cleanPath = path.replace(/\\/g, "/").replace(/^\.?\/?/, "");
    return `${baseUrl}/${cleanPath}`;
  };

  // Action button handler
  const handleVerify = async (
    userId: number,
    riderName: string,
    status: VerificationStatus,
  ) => {
    setProcessingId(userId);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await api.patch(`/admin/verify-rider/${userId}`, { status });
      setRiders((prevRiders) =>
        prevRiders.map((r) => {
          if (r.id === userId) {
            return {
              ...r,
              riderVerification: r.riderVerification
                ? { ...r.riderVerification, status }
                : undefined,
            };
          }
          return r;
        }),
      );

      setSuccessMessage(
        `Rider ${riderName} has been ${status === VerificationStatus.Approved ? "approved" : "rejected"} successfully!`,
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message || `Failed to ${status} rider.`,
        );
      } else {
        setErrorMessage(`Failed to ${status} rider. Please try again.`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Calculate count badges
  const counts = useMemo(() => {
    return {
      pending: riders.filter(
        (r) => r.riderVerification?.status === VerificationStatus.Pending,
      ).length,
      approved: riders.filter(
        (r) => r.riderVerification?.status === VerificationStatus.Approved,
      ).length,
      rejected: riders.filter(
        (r) => r.riderVerification?.status === VerificationStatus.Rejected,
      ).length,
      all: riders.length,
    };
  }, [riders]);

  // Filter riders based on active tab
  const filteredRiders = useMemo(() => {
    if (activeTab === "all") {
      return riders;
    }
    return riders.filter(
      (rider) => rider.riderVerification?.status === activeTab,
    );
  }, [riders, activeTab]);

  return (
    <AdminLayout
      title="Rider Verification Management"
      subtitle="Review uploaded NID documents and approve or reject rider accounts."
      currentPath="/admin/riders"
      backHref="/admin"
    >
      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
          {/* 🟡 Pending Applications */}
          <button
            type="button"
            onClick={() => setActiveTab(VerificationStatus.Pending)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === VerificationStatus.Pending
                ? "bg-amber-100 text-amber-900 shadow-xs ring-1 ring-amber-300"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span>🟡</span>
            <span>Pending Applications</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === VerificationStatus.Pending
                  ? "bg-amber-200 text-amber-900"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {counts.pending}
            </span>
          </button>

          {/* 🟢 Approved Riders */}
          <button
            type="button"
            onClick={() => setActiveTab(VerificationStatus.Approved)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === VerificationStatus.Approved
                ? "bg-emerald-100 text-emerald-900 shadow-xs ring-1 ring-emerald-300"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span>🟢</span>
            <span>Approved Riders</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === VerificationStatus.Approved
                  ? "bg-emerald-200 text-emerald-900"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {counts.approved}
            </span>
          </button>

          {/* 🔴 Rejected Applications */}
          <button
            type="button"
            onClick={() => setActiveTab(VerificationStatus.Rejected)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === VerificationStatus.Rejected
                ? "bg-rose-100 text-rose-900 shadow-xs ring-1 ring-rose-300"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span>🔴</span>
            <span>Rejected Applications</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === VerificationStatus.Rejected
                  ? "bg-rose-200 text-rose-900"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {counts.rejected}
            </span>
          </button>

          {/* ⚪ All Riders */}
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "all"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span>⚪</span>
            <span>All Riders</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === "all"
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {counts.all}
            </span>
          </button>
        </div>

        {/* Success & Error Alerts */}
        {successMessage && (
          <Alert type="success" message={successMessage} className="mt-6" />
        )}
        {errorMessage && (
          <Alert type="error" message={errorMessage} className="mt-6" />
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="mt-8 flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <span className="ml-3 text-base font-medium text-gray-600">
              Loading rider verification requests...
            </span>
          </div>
        ) : filteredRiders.length === 0 ? (
          /* Empty State */
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              🛵
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">
              {activeTab === VerificationStatus.Pending
                ? "No pending applications right now."
                : activeTab === VerificationStatus.Approved
                  ? "No approved riders found."
                  : activeTab === VerificationStatus.Rejected
                    ? "No rejected applications found."
                    : "No riders found."}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === VerificationStatus.Pending
                ? "All rider registrations have been reviewed."
                : "Try selecting a different filter tab above."}
            </p>
          </div>
        ) : (
          /* Riders Data Table */
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Rider Info
                    </th>
                    <th scope="col" className="px-6 py-4">
                      NID Number
                    </th>
                    <th scope="col" className="px-6 py-4">
                      NID Document
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Submitted Date
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
                  {filteredRiders.map((rider) => {
                    const verification = rider.riderVerification;
                    const status =
                      verification?.status || VerificationStatus.Pending;
                    const isProcessing = processingId === rider.id;
                    const nidUrl = getNidImageUrl(verification?.nidImagePath);

                    return (
                      <tr
                        key={rider.id}
                        className="transition hover:bg-gray-50/80"
                      >
                        {/* 1. Rider Info */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                              {rider.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {rider.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {rider.email}
                              </p>
                              <p className="text-xs font-medium text-gray-600">
                                {rider.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. NID Number */}
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-semibold text-gray-800">
                          {verification?.nidNumber || "N/A"}
                        </td>

                        {/* 3. NID Document Thumbnail */}
                        <td className="whitespace-nowrap px-6 py-4">
                          {nidUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(nidUrl)}
                              className="group relative flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1 transition hover:border-blue-400 hover:shadow-xs"
                              title="Click to zoom image"
                            >
                              <img
                                src={nidUrl}
                                alt="NID Preview"
                                className="h-10 w-14 rounded object-cover"
                              />
                              <span className="pr-1 text-xs font-medium text-blue-600 group-hover:underline">
                                🔍 View
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No document
                            </span>
                          )}
                        </td>

                        {/* 4. Submitted Date */}
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-600">
                          {new Date(
                            verification?.createdAt || rider.createdAt,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* 5. Status Badge */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <Badge variant={status} dot>
                            {status}
                          </Badge>
                        </td>

                        {/* 6. Actions (Approve / Reject) */}
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Approve Button */}
                            {status !== VerificationStatus.Approved && (
                              <Button
                                type="button"
                                onClick={() =>
                                  handleVerify(
                                    rider.id,
                                    rider.name,
                                    VerificationStatus.Approved,
                                  )
                                }
                                loading={isProcessing}
                                variant="primary"
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                Approve
                              </Button>
                            )}

                            {/* Reject Button */}
                            {status !== VerificationStatus.Rejected && (
                              <Button
                                type="button"
                                onClick={() =>
                                  handleVerify(
                                    rider.id,
                                    rider.name,
                                    VerificationStatus.Rejected,
                                  )
                                }
                                loading={isProcessing}
                                variant="danger"
                                size="sm"
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Image Preview Modal */}
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title="National ID (NID) Document Preview"
          description="Verify rider identity information and document clarity."
          maxWidth="2xl"
          footer={
            <div className="w-full flex items-center justify-between text-xs text-gray-500">
              <span>Press Esc or click outside to close</span>
              {previewImage && (
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Open in full resolution &rarr;
                </a>
              )}
            </div>
          }
        >
          {previewImage && (
            <div className="flex max-h-[68vh] items-center justify-center overflow-auto rounded-xl bg-gray-50 p-2 border border-gray-100">
              <img
                src={previewImage}
                alt="Rider NID Document"
                className="max-h-[62vh] w-auto max-w-full rounded-lg object-contain shadow-xs"
              />
            </div>
          )}
        </Modal>
    </AdminLayout>
  );
}
