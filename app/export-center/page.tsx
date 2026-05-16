import PageHero from "@/components/PageHero";

const exports = [
  ["Scout Report PDF", "Export player scouting reports for recruitment meetings."],
  ["Opponent Prep PDF", "Export match plans and opponent analysis."],
  ["Team Performance CSV", "Download team metrics for deeper analysis."],
  ["Executive Summary", "Generate management-ready summaries."],
];

export default function ExportCenterPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHero
          eyebrow="Export"
          title="Export Center"
          description="Prepare reports, PDFs and CSV exports for coaches, scouts and decision makers."
        />

        <section className="grid gap-6 md:grid-cols-2">
          {exports.map(([title, text]) => (
            <div key={title} className="glass-card rounded-3xl p-7">
              <h2 className="text-3xl font-black">{title}</h2>
              <p className="mt-4 text-slate-300">{text}</p>
              <button className="mt-6 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
                Coming Soon
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
