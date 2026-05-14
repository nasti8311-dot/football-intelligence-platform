import { prisma } from "@/lib/prisma";

export default async function DataQualityPage() {
  const events = await prisma.event.findMany();

  const total = events.length;
  const withPlayer = events.filter((e) => e.player).length;
  const withCoordinates = events.filter((e) => e.x != null && e.y != null).length;
  const withEndCoordinates = events.filter((e) => e.endX != null && e.endY != null).length;
  const withXg = events.filter((e) => e.xg != null).length;

  const score =
    total === 0
      ? 0
      : Math.round(
          ((withPlayer / total) * 25 +
            (withCoordinates / total) * 25 +
            (withEndCoordinates / total) * 20 +
            (withXg / total) * 30)
        );

  const checks = [
    ["Player Coverage", withPlayer, total],
    ["Start Coordinates", withCoordinates, total],
    ["End Coordinates", withEndCoordinates, total],
    ["xG Coverage", withXg, total],
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Platform Operations</p>
          <h1 className="text-5xl font-bold">Data Quality Center</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Prüft, ob deine Eventdaten vollständig genug für xThreat,
            Player Intelligence, Recruitment und Tactical Reports sind.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card title="Events" value={total.toString()} />
          <Card title="Quality Score" value={`${score}/100`} />
          <Card
            title="Status"
            value={score >= 75 ? "Strong" : score >= 45 ? "Usable" : "Weak"}
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="mb-6 text-2xl font-semibold">Coverage Checks</h2>

          <div className="space-y-5">
            {checks.map(([label, value, max]) => {
              const maxNumber = Number(max);
const valueNumber = Number(value);
const pct = maxNumber > 0 ? Math.round((valueNumber / maxNumber) * 100) : 0;

              return (
                <div key={String(label)}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-cyan-300">{pct}%</span>
                  </div>

                  <div className="h-4 rounded-full bg-slate-800">
                    <div
                      className="h-4 rounded-full bg-cyan-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-6">
          <p className="text-sm text-cyan-300">Recommendation</p>
          <h2 className="mt-2 text-2xl font-bold">
            {score >= 75
              ? "Deine Datenbasis ist gut für Advanced Analytics."
              : "Importiere mehr Events mit player, x/y, endX/endY und xG."}
          </h2>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 truncate text-3xl font-bold">{value}</p>
    </div>
  );
}
