import PageHero from "@/components/PageHero";

const sources = [
  ["Football-Data CSV", "Match results, teams, leagues, goals and fixtures.", "Active"],
  ["Event CSV", "Player actions, passes, shots, x/y coordinates and xG.", "Supported"],
  ["StatsBomb / Wyscout / Opta", "Professional event and tracking data providers.", "Future"],
  ["Manual Upload", "Upload CSV files through the platform.", "Active"],
];

export default function DataSourcesPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Data"
          title="Data Sources"
          description="Understand which data feeds power the analytics platform."
        />

        <section className="grid gap-6 md:grid-cols-2">
          {sources.map(([name, desc, status]) => (
            <div key={name} className="glass-card rounded-3xl p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-black">{name}</h2>
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                  {status}
                </span>
              </div>
              <p className="mt-4 text-slate-300">{desc}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
