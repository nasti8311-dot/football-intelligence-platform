export default function UploadCenterPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">

        <section>
          <p className="text-sm text-cyan-400">
            Data Import
          </p>

          <h1 className="text-5xl font-black">
            Upload Center
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Lade Match-, Event- oder Teamdaten hoch und analysiere sie automatisch.
          </p>
        </section>

        <section className="rounded-3xl border border-dashed border-cyan-400/40 bg-cyan-400/5 p-16 text-center">
          <div className="mx-auto max-w-xl">
            <div className="text-7xl">
              ⚽
            </div>

            <h2 className="mt-6 text-3xl font-bold">
              Drop CSV files here
            </h2>

            <p className="mt-4 text-slate-400">
              Unterstützte Dateien:
              Matchdaten, Eventdaten, Playerdaten, Football-Data CSVs.
            </p>

            <button className="mt-8 rounded-2xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 transition hover:scale-105">
              Select Files
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <InfoCard
            title="1. Upload"
            text="CSV-Datei auswählen oder per Drag & Drop hochladen."
          />

          <InfoCard
            title="2. Processing"
            text="Die Plattform verarbeitet und analysiert die Daten automatisch."
          />

          <InfoCard
            title="3. Insights"
            text="Dashboards, Predictions und Scout Reports werden erstellt."
          />
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h3 className="text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-slate-400">
        {text}
      </p>
    </div>
  );
}
