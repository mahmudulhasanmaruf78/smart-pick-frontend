import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      {/* 1. Simple Navbar */}
      <nav className="flex justify-between items-center py-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">SmartPick</h1>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-black font-medium">
            Login
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4">
          On-The-Way Peer-to-Peer Delivery
        </h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Connect senders directly with daily commuters. No middleman company, lower delivery costs.
        </p>

        {/* The 2 Clean Sign-Up Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 text-white font-medium px-6 py-3 rounded hover:bg-blue-700 transition text-center"
          >
            Sign Up as Customer
          </Link>
          <Link
            href="/rider/register"
            className="bg-green-600 text-white font-medium px-6 py-3 rounded hover:bg-green-700 transition text-center"
          >
            Sign Up as Rider
          </Link>
        </div>
      </section>

      {/* 3. How It Works (3 Simple Steps) */}
      <section className="py-8">
        <h3 className="text-xl font-bold text-center mb-6">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-4 rounded text-center">
            <h4 className="font-semibold mb-1">1. Post Parcel</h4>
            <p className="text-sm text-gray-500">Customer enters pickup & drop location.</p>
          </div>
          <div className="border p-4 rounded text-center">
            <h4 className="font-semibold mb-1">2. Rider Accepts</h4>
            <p className="text-sm text-gray-500">Commuter traveling that route claims it.</p>
          </div>
          <div className="border p-4 rounded text-center">
            <h4 className="font-semibold mb-1">3. Direct Delivery</h4>
            <p className="text-sm text-gray-500">Direct handoff, no middleman fees.</p>
          </div>
        </div>
      </section>

      {/* 4. Simple Footer */}
      <footer className="text-center py-8 border-t text-sm text-gray-400 mt-12">
        <p>SmartPick &copy; 2026</p>
      </footer>
    </div>
  );
}