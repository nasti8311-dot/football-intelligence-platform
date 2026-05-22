import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OpsCenterPage() {
  const [finished, oddsRows, snapshots, resolved, correct, upcoming] =
    await Promise.all([
      prisma.match.count({ where: { homeGoals: { not: null }, awayGoals: { not: null } } }),
      prisma.bookmakerOdds.count(),
      prisma.predictionSnapshot.count(),
      prisma.predictionSnapshot.count({ where: { isCorrect: { not: null } } }),
      prisma.predictionSnapshot.count({ where: { isCorrect: true } }),
      prisma.match.count({ where: { kickoff: { gte: new Date() } } }),
    ]);

  const accuracy = resolved ? Number(((correct / resolved) * 100).toFixed(1)) : 0;

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Operations
          </p>
          <h1 className="mt-3 text-5xl font-black">Ops Center</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Zentrale Steuerung für Datenqualität, Modellstatus, Launch-Bereitschaft und nächste Aktionen.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card label="Finished Matches" value={finished} />
          <Card label="Odds Rows" value={oddsRows} />
          <Card label="Accuracy" value={`${accuracy}%`} />
          <Card label="Snapshots" value={snapshots} />
          <Card label="Resolved" value={resolved} />
          <Card label="Upcoming" value={upcoming} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Nav href="/data-gaps" title="Data Gaps" desc="Warum Spiele nicht verified sind." />
          <Nav href="/recommended-actions" title="Recommended Actions" desc="Automatische nächste Schritte." />
          <Nav href="/launch-checklist" title="Launch Checklist" desc="Beta-Bereitschaft prüfen." />
          <Nav href="/model-quality" title="Model Quality" desc="Calibration und Marktqualität." />
          <Nav href="/xg-lab" title="xG Lab" desc="Expected Goals prüfen." />
          <Nav href="/quant-hub" title="Quant Hub" desc="Alle Quant-Bereiche." />
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

function Nav({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-emerald-400/40">
      <p className="text-2xl font-black">{title}</p>
      <p className="mt-2 text-sm text-neutral-400">{desc}</p>
    </Link>
  );
}
