const workspaces = [
  {
    name: "First Team Analysis",
    role: "Performance Department",
    members: 8,
  },
  {
    name: "Recruitment Unit",
    role: "Scouting Department",
    members: 5,
  },
  {
    name: "Academy Analytics",
    role: "Youth Development",
    members: 4,
  },
];

export default function WorkspacePage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Club SaaS</p>
          <h1 className="text-5xl font-bold">Workspaces</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Club-Arbeitsbereiche für Analysten, Scouts und Coaching Staff.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {workspaces.map((w) => (
            <div
              key={w.name}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-sm text-cyan-300">{w.role}</p>
              <h2 className="mt-2 text-2xl font-bold">{w.name}</h2>
              <p className="mt-4 text-slate-400">{w.members} members</p>

              <button className="mt-6 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
                Open Workspace
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
