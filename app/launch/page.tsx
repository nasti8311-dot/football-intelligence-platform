const checklist = [
  "Frontend Platform",
  "PostgreSQL Database",
  "Prisma ORM",
  "Prediction Engine",
  "Event Intelligence",
  "Player Analytics",
  "Recruitment AI",
  "Tactical Dashboards",
  "SaaS Pages",
  "Admin Imports",
];

export default function LaunchPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <section>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Launch Readiness
          </p>

          <h1 className="mt-2 text-6xl font-black">
            Ready for Production Path
          </h1>

          <p className="mt-4 max-w-3xl text-slate-400">
            Deine Football Intelligence Platform besitzt jetzt eine vollständige
            MVP-Struktur für Analytics, Prediction, Recruitment und SaaS.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {checklist.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5"
            >
              <p className="font-semibold text-emerald-300">✓ {item}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-8">
          <h2 className="text-3xl font-bold">Nächster echter Schritt</h2>
          <p className="mt-3 text-slate-300">
            Deployment auf Vercel + PostgreSQL Hosting auf Supabase/Railway.
          </p>
        </section>
      </div>
    </main>
  );
}
