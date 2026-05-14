export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Platform Configuration
          </p>

          <h1 className="text-5xl font-bold">
            Settings
          </h1>

          <p className="mt-3 text-slate-400">
            Zentrale Konfiguration deiner
            Football Intelligence Platform.
          </p>
        </section>

        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <Config
            title="Prediction Engine"
            description="Automatische Match Predictions aktiv"
          />

          <Config
            title="Recruitment AI"
            description="Similarity & Squad Fit aktiviert"
          />

          <Config
            title="Live Match Engine"
            description="Realtime Momentum Tracking"
          />

          <Config
            title="API Access"
            description="Developer APIs aktiviert"
          />

          <Config
            title="ML Training"
            description="Experimentelle Modelle aktiv"
          />
        </section>
      </div>
    </main>
  );
}

function Config({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-5">
      <div>
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="mt-1 text-slate-400">
          {description}
        </p>
      </div>

      <button className="rounded-full bg-emerald-400 px-5 py-2 font-bold text-slate-950">
        Enabled
      </button>
    </div>
  );
}
