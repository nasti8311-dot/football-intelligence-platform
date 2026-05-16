import PageHero from "@/components/PageHero";

const updates = [
  {
    title: "Platform upgraded with premium stadium UI",
    tag: "Design",
    text: "The interface now includes stadium backgrounds, glass cards and modern analytics layouts.",
  },
  {
    title: "Scout Dashboard expanded",
    tag: "Scouting",
    text: "Player rankings, AI scores, transfer profiles and role detection are now available.",
  },
  {
    title: "Match Center activated",
    tag: "Match Analysis",
    text: "Users can inspect individual matches, scores, event maps and tactical activity.",
  },
  {
    title: "Data Health Center added",
    tag: "Data",
    text: "The system now explains whether uploaded football data is strong enough for advanced analysis.",
  },
];

export default function NewsroomPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Product Updates"
          title="Newsroom"
          description="Latest platform updates, analytics features and product improvements."
        />

        <section className="grid gap-6 md:grid-cols-2">
          {updates.map((u) => (
            <article key={u.title} className="glass-card rounded-3xl p-7">
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                {u.tag}
              </span>

              <h2 className="mt-5 text-3xl font-black">{u.title}</h2>
              <p className="mt-4 text-slate-300">{u.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
