import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between p-6 max-w-4xl mx-auto">
      {/* 1. Simple Navbar */}
      <nav className="flex justify-between items-center py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">SmartPick</h1>
        <div>
          <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
            Login
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <main className="text-center py-20 my-auto">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
          On-The-Way Peer-to-Peer Delivery
        </h2>
        <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg">
          Connect senders directly with daily commuters. No middleman company, lower delivery costs.
        </p>

        {/* The 2 Clean Sign-Up Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 text-white font-medium px-8 py-3.5 rounded hover:bg-blue-700 transition text-center"
          >
            Sign Up as Customer
          </Link>
          <Link
            href="/rider/register"
            className="bg-green-600 text-white font-medium px-8 py-3.5 rounded hover:bg-green-700 transition text-center"
          >
            Sign Up as Rider
          </Link>
        </div>
      </main>

      {/* 3. Simple Footer */}
      <footer className="text-center py-6 border-t border-gray-200 text-sm text-gray-500">
        <p>SmartPick &copy; 2026</p>
      </footer>
    </div>
  );
}