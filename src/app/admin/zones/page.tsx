"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { DeliveryZone } from "@/types/zone";
import AdminLayout from "@/components/layout/AdminLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";

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

  // Form fields state
  const [name, setName] = useState<string>("");
  const [baseRegularFare, setBaseRegularFare] = useState<string>("");
  const [baseExpressFare, setBaseExpressFare] = useState<string>("");
  const [weightLimitKg, setWeightLimitKg] = useState<string>("");
  const [extraWeightRate, setExtraWeightRate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role =
      typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!token || role?.toLowerCase() !== "admin") {
      router.push("/login");
      return;
    }
    fetchZones();
  }, [router]);

  const handleOpenCreateModal = () => {
    setEditingZone(null);
    setName("");
    setBaseRegularFare("");
    setBaseExpressFare("");
    setWeightLimitKg("");
    setExtraWeightRate("");
    setErrorMessage("");
    setModalErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setName(zone.name);
    setBaseRegularFare(zone.baseRegularFare.toString());
    setBaseExpressFare(zone.baseExpressFare.toString());
    setWeightLimitKg(zone.weightLimitKg.toString());
    setExtraWeightRate(zone.extraWeightRate.toString());
    setErrorMessage("");
    setSuccessMessage("");
    setModalErrorMessage("");
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMessage("");
    setSuccessMessage("");

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

    const numRegularFare = Number(baseRegularFare);
    const numExpressFare = Number(baseExpressFare);
    const numWeightLimit = Number(weightLimitKg);
    const numExtraWeightRate = Number(extraWeightRate);

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
        await api.patch<DeliveryZone>(`/zones/${editingZone.id}`, payload);
        setSuccessMessage(`Zone "${payload.name}" updated successfully!`);
      } else {
        await api.post<DeliveryZone>("/zones", payload);
        setSuccessMessage(`Zone "${payload.name}" created successfully!`);
      }

      setIsModalOpen(false);
      await fetchZones();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const statusCode = error.response?.status;

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
    <AdminLayout
      title="Delivery Zones Management"
      subtitle="Set up delivery coverage areas, base regular/express fares, and extra weight rates."
      currentPath="/admin/zones"
      backHref="/admin"
      actions={
        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2"
        >
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>+ Add New Zone</span>
        </Button>
      }
    >
      {/* Alerts */}
      {successMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccessMessage("")}
          className="mb-6"
        >
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          variant="error"
          onClose={() => setErrorMessage("")}
          className="mb-6"
        >
          {errorMessage}
        </Alert>
      )}

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-base font-medium text-gray-600">
            Loading delivery zones...
          </span>
        </div>
      ) : zones.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl"></div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">
            No delivery zones found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first delivery coverage zone.
          </p>
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="mt-5"
          >
            + Add New Zone
          </Button>
        </div>
      ) : (
        /* Zones Table */
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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
                  <tr key={zone.id} className="transition hover:bg-gray-50/80">
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900">
                      {zone.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-700">
                      ৳{Number(zone.baseRegularFare).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-blue-600">
                      ৳{Number(zone.baseExpressFare).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      <Badge variant="default" size="sm">
                        {zone.weightLimitKg} kg
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      ৳{Number(zone.extraWeightRate).toFixed(2)} / kg
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(zone)}
                        className="inline-flex items-center gap-1.5"
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
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Zone Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingZone ? `Edit Zone: ${editingZone.name}` : "Add New Zone"}
        size="lg"
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          {modalErrorMessage && (
            <Alert variant="error" className="mb-2">
              {modalErrorMessage}
            </Alert>
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

          {/* Form Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              {editingZone ? "Update Zone" : "Save Zone"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
