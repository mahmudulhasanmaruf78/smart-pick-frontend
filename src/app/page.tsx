import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      {/* 1. Simple Navbar */}
      <nav className="flex justify-between items-center py-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">📦 SmartPick</h1>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-black">
            Login
          </Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded">
            Register
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section (Project Idea) */}
      <section className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4">
          On-The-Way Peer-to-Peer Delivery
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          SmartPick connects senders directly with daily commuters (like students and jobholders).
          No middleman company, faster delivery, and lower costs.
        </p>

        <div className="space-x-4">
          <Link
            href="/create-order"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded"
          >
            Send a Parcel
          </Link>
          <Link
            href="/login"
            className="border border-gray-400 px-6 py-3 rounded text-gray-700"
          >
            Track Order
          </Link>
        </div>
      </section>

      {/* 3. How It Works (3 Simple Cards) */}
      <section className="py-8">
        <h3 className="text-2xl font-bold text-center mb-6">How It Works</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border p-4 rounded text-center">
            <h4 className="font-bold text-lg mb-2">1. Post Parcel</h4>
            <p className="text-sm text-gray-600">
              Enter your pickup and drop location.
            </p>
          </div>

          <div className="border p-4 rounded text-center">
            <h4 className="font-bold text-lg mb-2">2. Commuter Accepts</h4>
            <p className="text-sm text-gray-600">
              A rider traveling that same route picks it up.
            </p>
          </div>

          <div className="border p-4 rounded text-center">
            <h4 className="font-bold text-lg mb-2">3. Direct Delivery</h4>
            <p className="text-sm text-gray-600">
              Direct handoff with no warehouse delays or middleman fees.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Simple Footer */}
      <footer className="text-center py-8 border-t text-sm text-gray-500 mt-12">
        <p>SmartPick Delivery System &copy; 2026</p>
      </footer>
    </div>
  );
}
