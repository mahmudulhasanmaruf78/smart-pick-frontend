import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      {/* 1. Simple Navbar */}
      <nav className="flex justify-between items-center py-4 border-b">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          SmartPick
        </Link>
        <div className="flex items-center space-x-3">
          <Link href="/login" className="text-gray-600 hover:text-black font-medium">
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
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4">
          On-The-Way Peer-to-Peer Delivery
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-8 text-lg">
          SmartPick connects senders directly with daily commuters (like students and jobholders).
          No middleman company, faster delivery, and lower costs.
        </p>

        {/* The 2 Main Sign Up Options */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <Link
            href="/register"
            className="bg-blue-600 text-white font-semibold px-8 py-3.5 rounded shadow hover:bg-blue-700 transition text-center text-lg"
          >
            Sign Up as Customer
          </Link>
          <Link
            href="/rider/register"
            className="bg-green-600 text-white font-semibold px-8 py-3.5 rounded shadow hover:bg-green-700 transition text-center text-lg"
          >
            Sign Up as Rider
          </Link>
        </div>

        <div>
          <Link
            href="/create-order"
            className="text-sm text-gray-500 hover:text-blue-600 underline font-medium"
          >
            Already a member? Book a Parcel directly &rarr;
          </Link>
        </div>
      </section>

      {/* 3. Choose Your Role Section */}
      <section className="py-8">
        <h3 className="text-2xl font-bold text-center mb-6">Get Started with SmartPick</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Card */}
          <div className="border p-6 rounded-lg bg-blue-50/50 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xl mb-2 text-blue-900">For Customers</h4>
              <p className="text-gray-600 text-sm mb-4">
                Need to deliver documents, packages, or fragile items across town? Connect directly with daily travelers on that route and save money.
              </p>
            </div>
            <Link
              href="/register"
              className="block w-full bg-blue-600 text-white text-center py-2.5 rounded font-semibold hover:bg-blue-700 transition"
            >
              Sign Up as Customer
            </Link>
          </div>

          {/* Rider Card */}
          <div className="border p-6 rounded-lg bg-green-50/50 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xl mb-2 text-green-900">For Riders / Commuters</h4>
              <p className="text-gray-600 text-sm mb-4">
                Are you a university student or office commuter? Pick up a parcel that matches your daily travel destination and earn pocket money easily.
              </p>
            </div>
            <Link
              href="/rider/register"
              className="block w-full bg-green-600 text-white text-center py-2.5 rounded font-semibold hover:bg-green-700 transition"
            >
              Sign Up as Rider
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How It Works (3 Simple Cards) */}
      <section className="py-8 border-t mt-6">
        <h3 className="text-2xl font-bold text-center mb-6">How It Works</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border p-4 rounded text-center">
            <h4 className="font-bold text-lg mb-2">1. Post Parcel</h4>
            <p className="text-sm text-gray-600">
              Customers enter pickup and drop location.
            </p>
          </div>

          <div className="border p-4 rounded text-center">
            <h4 className="font-bold text-lg mb-2">2. Commuter Accepts</h4>
            <p className="text-sm text-gray-600">
              A verified rider traveling that route claims the delivery.
            </p>
          </div>

          <div className="border p-4 rounded text-center">
            <h4 className="font-bold text-lg mb-2">3. Direct Delivery</h4>
            <p className="text-sm text-gray-600">
              Direct handoff with zero middleman overhead.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Simple Footer */}
      <footer className="text-center py-8 border-t text-sm text-gray-500 mt-12">
        <p>SmartPick Delivery System &copy; 2026</p>
      </footer>
    </div>
  );
}