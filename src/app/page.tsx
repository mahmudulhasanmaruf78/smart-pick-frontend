import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* 1. Full-width Navbar */}
      <nav className="w-full border-b border-gray-200 py-4 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">SmartPick</h1>
          <div>
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 font-medium text-base"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Full Screen Hero Section */}
      <main className="w-full max-w-4xl mx-auto px-6 text-center py-24 my-auto">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 leading-tight">
          On-The-Way Peer-to-Peer Delivery
        </h2>
        <p className="text-gray-600 mb-10 max-w-xl mx-auto text-lg">
          Connect senders directly with daily commuters. No middleman company,
          lower delivery costs.
        </p>

        {/* The 2 Clean Sign-Up Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 text-white font-medium px-8 py-3.5 rounded hover:bg-blue-700 transition text-center text-base"
          >
            Sign Up as Customer
          </Link>
          <Link
            href="/rider/register"
            className="bg-green-600 text-white font-medium px-8 py-3.5 rounded hover:bg-green-700 transition text-center text-base"
          >
            Sign Up as Rider
          </Link>
        </div>
      </main>

      {/* 3. Full-width Footer */}
      <footer className="w-full border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>SmartPick &copy; 2026</p>
      </footer>
    </div>
  );
}
