"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeliveryZone } from "@/types/zone";

export default function AdminZonesPage() {
  // Zone list state
  const [zones, setZones] = useState<DeliveryZone[]>([]);

  // Page loading and feedback message
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Modal state (Add/Edit Zone Modal)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  // Form fields state (using string for easier input handling)
  const [name, setName] = useState<string>("");
  const [baseRegularFare, setBaseRegularFare] = useState<string>("");
  const [baseExpressFare, setBaseExpressFare] = useState<string>("");
  const [weightLimitKg, setWeightLimitKg] = useState<string>("");
  const [extraWeightRate, setExtraWeightRate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal error dekhanor jonno state
  const [modalErrorMessage, setModalErrorMessage] = useState<string>("");

  // Function to fetch zones
  const fetchZones = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<DeliveryZone[]>("/zones");
      setZones(response.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Failed to load delivery zones.",
        );
      } else {
        setErrorMessage("Failed to connect to server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const router = useRouter();

  // Page load time data fetch
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!token || role?.toLowerCase() !== "admin") {
      router.push("/login");
      return;
    }
    fetchZones();
  }, [router]);

  // Add Zone button click handler function to clear the form and open the modal
  const handleOpenCreateModal = () => {
    setEditingZone(null); // Confirmation of create mode to null
    setName("");
    setBaseRegularFare("");
    setBaseExpressFare("");
    setWeightLimitKg("");
    setExtraWeightRate("");
    setErrorMessage("");
    setModalErrorMessage("");
    setIsModalOpen(true); // Modal open
  };
  // Edit Zone button click handler function to pre-fill data and open the modal
  const handleOpenEditModal = (zone: DeliveryZone) => {
    setEditingZone(zone); // Confirmation of edit mode to null
    setName(zone.name);
    setBaseRegularFare(zone.baseRegularFare.toString());
    setBaseExpressFare(zone.baseExpressFare.toString());
    setWeightLimitKg(zone.weightLimitKg.toString());
    setExtraWeightRate(zone.extraWeightRate.toString());
    setErrorMessage("");
    setSuccessMessage("");
    setModalErrorMessage("");
    setIsModalOpen(true); // Modal open
  };

  // Form submission & API integration (Create & Update)
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMessage("");
    setSuccessMessage("");

    // Client-side check: ensure all fields are filled
    if (
      !name.trim() ||
      baseRegularFare === "" ||
      baseExpressFare === "" ||
      weightLimitKg === "" ||
      extraWeightRate === ""
    ) {
      setModalErrorMessage("All fields are required.");
      return;
    }

    // Number Conversion
    const numRegularFare = Number(baseRegularFare);
    const numExpressFare = Number(baseExpressFare);
    const numWeightLimit = Number(weightLimitKg);
    const numExtraWeightRate = Number(extraWeightRate);

    // Validation check: ensure numbers are valid and positive
    if (
      isNaN(numRegularFare) ||
      isNaN(numExpressFare) ||
      isNaN(numWeightLimit) ||
      isNaN(numExtraWeightRate)
    ) {
      setModalErrorMessage("Fares and weights must be valid numbers.");
      return;
    }

    if (
      numRegularFare < 0 ||
      numExpressFare < 0 ||
      numWeightLimit <= 0 ||
      numExtraWeightRate < 0
    ) {
      setModalErrorMessage(
        "Fares and extra weight rates cannot be negative, and weight limit must be greater than 0.",
      );
      return;
    }

    // Payload creation
    const payload = {
      name: name.trim(),
      baseRegularFare: numRegularFare,
      baseExpressFare: numExpressFare,
      weightLimitKg: numWeightLimit,
      extraWeightRate: numExtraWeightRate,
    };

    setIsSubmitting(true);

    try {
      if (editingZone) {
        // if editing: PATCH /zones/:id
        await api.patch<DeliveryZone>(`/zones/${editingZone.id}`, payload);
        setSuccessMessage(`Zone "${payload.name}" updated successfully!`);
      } else {
        // if new: POST /zones
        await api.post<DeliveryZone>("/zones", payload);
        setSuccessMessage(`Zone "${payload.name}" created successfully!`);
      }

      // Close modal and refresh list on success
      setIsModalOpen(false);
      await fetchZones();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const statusCode = error.response?.status;

        // 409 Conflict or Duplicate Zone Error
        if (statusCode === 409) {
          setModalErrorMessage(
            Array.isArray(message)
              ? message.join(", ")
              : message || `A zone named "${payload.name}" already exists.`,
          );
        } else {
          setModalErrorMessage(
            Array.isArray(message)
              ? message.join(", ")
              : message || "Failed to save zone. Please try again.",
          );
        }
      } else {
        setModalErrorMessage("Failed to connect to server.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back to Admin Dashboard Link */}
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Delivery Zones Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Set up delivery coverage areas, base regular/express fares, and
              extra weight rates.
            </p>
          </div>

          {/* "+ Add New Zone" Button */}
          <div>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>+ Add New Zone</span>
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
              Loading delivery zones...
            </span>
          </div>
        ) : zones.length === 0 ? (
          /* Empty State */
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              🗺️
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">
              No delivery zones found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first delivery coverage zone.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Add New Zone
            </button>
          </div>
        ) : (
          /* Zones Table */
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Zone Name
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Base Regular Fare
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Base Express Fare
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Weight Limit
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Extra Weight Rate
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white text-sm">
                  {zones.map((zone) => (
                    <tr
                      key={zone.id}
                      className="transition hover:bg-gray-50/80"
                    >
                      {/* Zone Name */}
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900">
                        {zone.name}
                      </td>

                      {/* Regular Fare */}
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-700">
                        ৳{Number(zone.baseRegularFare).toFixed(2)}
                      </td>

                      {/* Express Fare */}
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-blue-600">
                        ৳{Number(zone.baseExpressFare).toFixed(2)}
                      </td>

                      {/* Weight Limit */}
                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {zone.weightLimitKg} kg
                        </span>
                      </td>

                      {/* Extra Weight Rate */}
                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        ৳{Number(zone.extraWeightRate).toFixed(2)} / kg
                      </td>

                      {/* Actions (Edit Button) */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(zone)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add / Edit Zone Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingZone
                      ? `Edit Zone: ${editingZone.name}`
                      : "Add New Zone"}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {editingZone
                      ? "Update the fare and weight parameters for this zone."
                      : "Configure new delivery coverage area and fare rates."}
                  </p>
                </div>

                {/* Close (X) button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleModalSubmit} className="mt-5 space-y-4">
                {/* Modal Inner Error Message (409 Conflict / Validation) */}
                {modalErrorMessage && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-700 shadow-xs"
                  >
                    {modalErrorMessage}
                  </div>
                )}
                {/* 1. Zone Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Zone Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Inside Dhaka"
                    className="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                {/* 2 & 3. Regular & Express Fare (2 columns) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Base Regular Fare (৳)
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-gray-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={baseRegularFare}
                        onChange={(e) => setBaseRegularFare(e.target.value)}
                        placeholder="60"
                        className="block w-full rounded-xl border border-gray-300 pl-8 pr-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Base Express Fare (৳)
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-gray-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={baseExpressFare}
                        onChange={(e) => setBaseExpressFare(e.target.value)}
                        placeholder="100"
                        className="block w-full rounded-xl border border-gray-300 pl-8 pr-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4 & 5. Weight Limit & Extra Weight Rate (2 columns) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Weight Limit (kg)
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={weightLimitKg}
                        onChange={(e) => setWeightLimitKg(e.target.value)}
                        placeholder="2"
                        className="block w-full rounded-xl border border-gray-300 pr-12 pl-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-gray-500">
                        kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Extra Weight Rate (৳/kg)
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-gray-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={extraWeightRate}
                        onChange={(e) => setExtraWeightRate(e.target.value)}
                        placeholder="20"
                        className="block w-full rounded-xl border border-gray-300 pl-8 pr-12 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-gray-500">
                        /kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    <span>
                      {isSubmitting
                        ? "Saving..."
                        : editingZone
                          ? "Update Zone"
                          : "Save Zone"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
