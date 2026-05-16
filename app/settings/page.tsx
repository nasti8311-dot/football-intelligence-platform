import PageHero from "@/components/PageHero";

const settings = [
  ["Theme", "Stadium Dark"],
  ["Data Mode", "Demo + Imported Data"],
  ["Reports", "Enabled"],
  ["Scouting AI", "Enabled"],
  ["Prediction Engine", "Enabled"],
];

export default function SettingsPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHero
          eyebrow="Workspace"
          title="Settings"
          description="Manage platform preferences and analytics modules."
        />

        <section className="grid gap-5">
          {settings.map(([label, value]) => (
            <div key={label} className="glass-card flex items-center justify-between rounded-3xl p-6">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-black">{value}</p>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Active
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
