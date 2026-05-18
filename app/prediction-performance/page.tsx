import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${Math.round(v)}%`;
}

export default async function PredictionPerformancePage() {
  const leagueCalibrationRows = (await prisma.$queryRawUnsafe(`
    SELECT "league","sampleSize","accuracy","roi","profit"
    FROM "LeagueCalibration"
    ORDER BY "sampleSize" DESC
  `).catch(() => [])) as any[];

  const calibrationRows = (await prisma.$queryRawUnsafe(`
    SELECT "market","sampleSize","accuracy","roi","profit"
    FROM "ModelCalibration"
    ORDER BY "market" ASC
  `).catch(() => [])) as any[];

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

          <a
            href="/"
            className="mt-6 inline-block rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Back to today&apos;s picks
          </a>

          <p className="mt-4 max-w-2xl text-slate-300">
           Live performance tracking from stored prediction snapshots, including accuracy, value-pick tracking and ROI simulation.
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

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Model Calibration</h2>
          <p className="mt-2 text-slate-300">
            Markt-spezifisches Learning aus echten ausgewerteten Snapshots.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {calibrationRows.map((r: any) => (
              <div key={r.market} className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  {r.market}
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {Math.round(Number(r.accuracy || 0))}% Acc
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Sample {r.sampleSize} · ROI {Math.round(Number(r.roi || 0))}%
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">League Calibration</h2>
          <p className="mt-2 text-slate-300">
            Erkennt, in welchen Ligen das Modell aktuell besser oder schwächer performt.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {leagueCalibrationRows.map((r: any) => (
              <div key={r.league} className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {r.league}
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {Math.round(Number(r.accuracy || 0))}% Acc
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Sample {r.sampleSize} · ROI {Math.round(Number(r.roi || 0))}%
                </p>
              </div>
            ))}
          </div>
        </section>

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

              {s.summary && (
                <div className="mt-4 rounded-2xl bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                    Snapshot Summary
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {s.summary}
                  </p>
                </div>
              )}

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
