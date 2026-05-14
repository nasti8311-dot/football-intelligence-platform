const phases = [
  {
    title: "MVP Completed",
    items: [
      "Prediction Engine",
      "Event Intelligence",
      "Player Analytics",
      "Recruitment AI",
      "Tactical Dashboards",
      "PostgreSQL + Prisma",
    ],
  },
  {
    title: "Production Next",
    items: [
      "Auth/Login echt machen",
      "Deployment auf Vercel",
      "Datenbank auf Supabase/Railway",
      "Backup-System",
      "API Security",
    ],
  },
  {
    title: "Commercial SaaS",
    items: [
      "Stripe Billing",
      "Club Workspaces",
      "User Roles",
      "Subscription Limits",
      "Admin Panel",
    ],
  },
  {
    title: "Advanced AI",
    items: [
      "echte ML Pipelines",
      "automatisches Training",
      "Live Data Feeds",
      "Model Evaluation",
      "AI Match Reports",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Product Strategy</p>
          <h1 className="text-5xl font-bold">Production Roadmap</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Überblick, was bereits steht und was für eine echte SaaS-Veröffentlichung noch fehlt.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {phases.map((phase) => (
            <div
              key={phase.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <h2 className="text-2xl font-bold">{phase.title}</h2>

              <div className="mt-5 space-y-3">
                {phase.items.map((item) => (
                  <p key={item} className="text-slate-300">
                    ✓ {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
