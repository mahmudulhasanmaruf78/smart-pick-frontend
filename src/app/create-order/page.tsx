"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomerLayout from "@/components/layout/CustomerLayout";
import RiderLayout from "@/components/layout/RiderLayout";
import Card from "@/components/ui/Card";
import OrderForm from "@/components/orders/OrderForm";

export default function CreateOrderPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const storedRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    if (storedRole) {
      setRole(storedRole.toLowerCase());
    }
  }, [router]);

  const isRider = role === "rider";

  const formContent = (
    <Card>
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Book a Consignment</h2>
      <p className="text-sm text-gray-500 mb-6">
        Fill in the details below. Our commuter network will pick it up along their route.
      </p>
      <OrderForm />
    </Card>
  );

  if (isRider) {
    return (
      <RiderLayout currentPath="/create-order" maxWidth="max-w-xl">
        {formContent}
      </RiderLayout>
    );
  }

  return (
    <CustomerLayout currentPath="/create-order" maxWidth="max-w-xl">
      {formContent}
    </CustomerLayout>
  );
}