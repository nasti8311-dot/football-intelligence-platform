import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${Math.round(v)}%`;
}

export default async function PredictionPerformancePage() {
  const snapshots: any[] = await prisma.$queryRawUnsafe(`
    SELECT ps.*, m."homeTeamId", m."awayTeamId", m."homeGoals", m."awayGoals"
    FROM "PredictionSnapshot" ps
    JOIN "Match" m ON m.id = ps."matchId"
    ORDER BY ps."createdAt" DESC
    LIMIT 250
  `);

  const evaluated = snapshots.filter((s) => s.isCorrect !== null);
  const pendingCount = snapshots.filter((s) => s.isCorrect === null).length;
  const correct = evaluated.filter((s) => s.isCorrect === true).length;
  const wrong = evaluated.filter((s) => s.isCorrect === false).length;
  const accuracy = evaluated.length ? (correct / evaluated.length) * 100 : 0;

  const high = evaluated.filter((s) => s.confidence === "High");
  const highCorrect = high.filter((s) => s.isCorrect === true).length;
  const highAccuracy = high.length ? (highCorrect / high.length) * 100 : 0;

  const value = evaluated.filter((s) => Number(s.edge || 0) >= 6);
  const valueCorrect = value.filter((s) => s.isCorrect === true).length;
  const valueAccuracy = value.length ? (valueCorrect / value.length) * 100 : 0;

  const roiBets = evaluated.filter((s) => s.oddsPrice);
  const profit = roiBets.reduce((sum, s) => {
    if (s.isCorrect === true) return sum + (Number(s.oddsPrice) - 1);
    if (s.isCorrect === false) return sum - 1;
    return sum;
  }, 0);

  const roi = roiBets.length ? (profit / roiBets.length) * 100 : 0;

  const squadRisk = evaluated.filter((s) => Number(s.injuryPenalty || 0) > 0.08);
  const squadRiskCorrect = squadRisk.filter((s) => s.isCorrect === true).length;
  const squadRiskAccuracy = squadRisk.length ? (squadRiskCorrect / squadRisk.length) * 100 : 0;

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Prediction Accuracy
          </p>

          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
            Prediction Performance
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Echte Trefferquote aus gespeicherten Daily-Pick-Snapshots.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Card label="Gespeichert" value={String(snapshots.length)} />
            <Card label="Pending" value={String(pendingCount)} />
            <Card label="Correct" value={String(correct)} />
            <Card label="Wrong" value={String(wrong)} />
            <Card label="Accuracy" value={pct(accuracy)} />
            <Card label="High Accuracy" value={pct(highAccuracy)} />
            <Card label="Value Accuracy" value={pct(valueAccuracy)} />
            <Card label="ROI Test" value={pct(roi)} />
            <Card label="Squad Risk Acc." value={pct(squadRiskAccuracy)} />
            <Card label="ROI Test" value={pct(roi)} />
            <Card label="Squad Risk Acc." value={pct(squadRiskAccuracy)} />
          </div>
        </section>

        {evaluated.length === 0 && (
          <section className="glass-card rounded-3xl p-6 text-center">
            <h2 className="text-2xl font-black">Noch keine ausgewerteten Picks</h2>
            <p className="mt-2 text-slate-300">
              Sobald gespeicherte Picks ein Endergebnis haben, berechnet diese Seite echte Accuracy, Value Accuracy und ROI.
            </p>
          </section>
        )}

        <section className="grid gap-4">
          {snapshots.slice(0, 60).map((s) => (
            <article key={s.id} className="glass-card rounded-3xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    {s.market} · {s.confidence}
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    {s.homeTeamId} vs {s.awayTeamId}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Pick: {s.pick} · Modell {Math.round(Number(s.probability))}%
                    {s.edge ? ` · Edge +${Number(s.edge).toFixed(1)}%` : ""}
                  </p>
                </div>

                <div
                  className={`rounded-full px-4 py-2 text-sm font-black ${
                    s.isCorrect === true
                      ? "bg-emerald-400/15 text-emerald-300"
                      : s.isCorrect === false
                      ? "bg-red-400/15 text-red-300"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {s.isCorrect === true
                    ? "Correct"
                    : s.isCorrect === false
                    ? "Wrong"
                    : "Pending"}
                </div>
              </div>

              {s.result && (
                <p className="mt-4 text-3xl font-black text-cyan-300">
                  Ergebnis {s.result}
                </p>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-950/60 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
