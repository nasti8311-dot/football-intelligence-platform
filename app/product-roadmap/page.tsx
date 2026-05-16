import PageHero from "@/components/PageHero";

const roadmap = [
  ["Now", "Football analytics demo", "Dashboards, reports, event maps and scouting tools are live."],
  ["Next", "Real data integrations", "Connect richer event providers and automated data pipelines."],
  ["Soon", "Authentication & teams", "Add users, workspaces, saved reports and private club dashboards."],
  ["Later", "Commercial SaaS", "Add billing, API access, white-label reports and enterprise plans."],
];

export default function ProductRoadmapPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHero
          eyebrow="Product Strategy"
          title="Roadmap"
          description="A clear path from prototype to real football analytics SaaS."
        />

        <section className="space-y-5">
          {roadmap.map(([phase, title, text]) => (
            <div key={phase} className="glass-card rounded-3xl p-7">
              <p className="text-sm text-cyan-300">{phase}</p>
              <h2 className="mt-2 text-3xl font-black">{title}</h2>
              <p className="mt-3 text-slate-300">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
