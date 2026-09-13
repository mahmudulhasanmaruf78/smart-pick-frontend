"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      <Navbar />

      {/* Hero Section */}
      <main className="w-full max-w-4xl mx-auto px-6 text-center py-20 my-auto">
        <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full mb-6 uppercase tracking-wider">
          Peer-to-Peer Parcel Crowdsourcing
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
          On-The-Way Delivery <br />
          <span className="text-blue-600">Direct From Commuters</span>
        </h1>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
          Connect parcel senders directly with everyday university students and commuters traveling the same route. No corporate courier delays, zero unnecessary hub hops, and lower transit fares.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/create-order">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8">
              Book Delivery Now
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              Sign Up as Customer
            </Button>
          </Link>
          <Link href="/rider/register">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 border border-gray-200">
              Deliver & Earn (Rider)
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>SmartPick (ZoneExpress BD) &copy; 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}