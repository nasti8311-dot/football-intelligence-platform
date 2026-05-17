import Link from "next/link";
import PageHero from "@/components/PageHero";

const lessons = [
  ["What is xG?", "Understand expected goals and shot quality.", "/guide"],
  ["How to scout players", "Use AI scores, roles and player profiles.", "/scout-dashboard"],
  ["How to prepare opponents", "Build a simple match plan from opponent data.", "/opponent-prep"],
  ["How to check data quality", "Know whether your dataset is strong enough.", "/data-health"],
];

export default function AcademyPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Learning"
          title="Football Analytics Academy"
          description="A simple learning center for users who are new to football analytics."
        />

        <section className="grid gap-6 md:grid-cols-2">
          {lessons.map(([title, text, href]) => (
            <Link key={title} href={href} className="glass-card rounded-3xl p-8 transition hover:scale-[1.02]">
              <h2 className="text-3xl font-black">{title}</h2>
              <p className="mt-4 text-slate-300">{text}</p>
              <p className="mt-6 font-bold text-cyan-300">Start lesson →</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
