import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl mb-6">Page not found</p>
        <Link
          href="/dashboard"
          className="underline text-white hover:text-zinc-400 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
