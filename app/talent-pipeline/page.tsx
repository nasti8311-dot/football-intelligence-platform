import PageHero from "@/components/PageHero";

const stages = [
  ["Identified", "Players detected by AI scouting model", 42],
  ["Shortlisted", "Players matching recruitment needs", 18],
  ["Reviewed", "Profiles reviewed by scout team", 9],
  ["Priority", "High-priority recruitment targets", 4],
];

export default function TalentPipelinePage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Recruitment"
          title="Talent Pipeline"
          description="A recruitment workflow for moving players from discovery to priority target."
        />

        <section className="grid gap-6 md:grid-cols-4">
          {stages.map(([title, text, count]) => (
            <div key={title.toString()} className="glass-card rounded-3xl p-7">
              <p className="text-6xl font-black text-cyan-300">{count}</p>
              <h2 className="mt-5 text-3xl font-black">{title}</h2>
              <p className="mt-3 text-slate-300">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
