// Full-route pending fallback, rendered by each segment's loading.tsx via
// Suspense while the server render (and its downstream reads) is in flight —
// so a slow service shows a spinner instead of a frozen page.
export function RouteSpinner({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <div
      className={`min-h-screen flex items-center justify-center ${dark ? "bg-black" : "bg-[#FAF9F7]"}`}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 border-t-transparent animate-spin ${
          dark ? "border-white/40" : "border-zinc-300"
        }`}
      />
    </div>
  );
}
