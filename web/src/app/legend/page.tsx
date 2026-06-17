import { redirect } from "next/navigation";
import { getLegend } from "@/actions/legend";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";
import { LegendForm } from "@/app/legend/_components/LegendForm";
import { SectionError } from "@/app/_components/SectionError";
import { getCurrentUser } from "@/lib/auth";

// Three states: legend present → read-only view; confirmed absent → create form;
// semantic unreachable → in-place error (never the form, so we don't invite a
// duplicate against a legend that just couldn't load). Set once, no edit path.
export default async function LegendPage() {
  const { userId, role } = await getCurrentUser();
  if (role !== "insider") redirect("/dashboard");
  const legend = await getLegend(userId);

  const text = legend.ok ? legend.data : null;
  // Nav dot only on confirmed-absent; unknown shows no dot.
  const hasLegend = legend.ok ? legend.data !== null : true;

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans selection:bg-zinc-900 selection:text-white">
      <InsiderNav hasLegend={hasLegend} />

      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold mb-2">
            Personal Expertise
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">Your Legend</h1>
          {legend.ok && (
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              {text
                ? "This is what clients see before buying. It's set once and can't be edited."
                : "This is what clients see before buying. Write from experience — who you are and what you know. You won't appear in matches until you add it."}
            </p>
          )}
        </header>

        {!legend.ok ? (
          <SectionError code={legend.error.code} op="semantic.legend" tone="light" />
        ) : text ? (
          <section className="flex flex-col gap-3">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold px-1">
              Expertise
            </label>
            <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 text-base text-zinc-700 leading-relaxed whitespace-pre-wrap">
              {text}
            </div>
            <p className="text-[10px] text-emerald-600 px-1 uppercase tracking-widest font-bold">
              ✓ Set · visible to clients
            </p>
          </section>
        ) : (
          <LegendForm />
        )}
      </main>
    </div>
  );
}
