import { getMockRole } from "@/lib/mock-role";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";
import { ExpertTools } from "@/app/settings/_components/ApiClient";
import { SessionSection } from "@/app/settings/_components/SignOutClient";

export default async function SettingsPage() {
  const role = await getMockRole();
  const isClient = role === "client";

  const Nav = isClient ? ClientNav : InsiderNav;

  return (
    <div
      className={`min-h-screen font-sans ${isClient ? "bg-black text-white" : "bg-[#FAF9F7] text-[#2A2520]"}`}
    >
      <Nav />
      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <h1
            className={`text-4xl font-bold ${isClient ? "bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent" : "text-zinc-900"}`}
          >
            Settings
          </h1>
        </header>

        <section>
          <ExpertTools isClient={isClient} />
          <SessionSection isClient={isClient} />
        </section>
      </main>
    </div>
  );
}
