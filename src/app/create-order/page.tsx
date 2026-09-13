"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import OrderForm from "@/components/orders/OrderForm";

export default function CreateOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      <Navbar />
      <div className="max-w-xl mx-auto p-4 py-8">
        <Card>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Book a Consignment</h2>
          <p className="text-sm text-gray-500 mb-6">
            Fill in the details below. Our commuter network will pick it up along their route.
          </p>
          <OrderForm />
        </Card>
      </div>
    </div>
  );
}