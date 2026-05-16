import PageHero from "@/components/PageHero";

const modules = [
  ["Club Workspace", "Manage club-level analytics and reports."],
  ["Scout Workspace", "Track player profiles and recruitment targets."],
  ["Coach Workspace", "Prepare opponents and match plans."],
  ["Data Workspace", "Monitor uploads, data health and sources."],
];

export default function WorkspacePage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Workspace"
          title="Workspace"
          description="A future home for teams, users, roles and saved football analytics projects."
        />

        <section className="grid gap-6 md:grid-cols-2">
          {modules.map(([title, text]) => (
            <div key={title} className="glass-card rounded-3xl p-8">
              <h2 className="text-3xl font-black">{title}</h2>
              <p className="mt-4 text-slate-300">{text}</p>
              <span className="mt-6 inline-block rounded-full bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                Coming Soon
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
