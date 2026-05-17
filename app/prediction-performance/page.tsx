import { prisma } from "@/lib/prisma";
import { buildPredictions } from "@/lib/predictions";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${Math.round(v)}%`;
}

export default async function PredictionPerformancePage() {
  const rows = await prisma.match.findMany({
    take: 2500,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const matches = rows.map((m) => ({
    id: m.id,
    kickoff: m.kickoff,
    league: m.league?.name ?? "League",
    home: m.homeTeam?.name || m.homeTeamId,
    away: m.awayTeam?.name || m.awayTeamId,
    homeGoals: m.homeGoals,
    awayGoals: m.awayGoals,
  }));

  const predictions = buildPredictions(matches);

  const finished = rows.filter(
    (m) =>
      m.homeGoals !== null &&
      m.awayGoals !== null &&
      m.kickoff &&
      new Date(m.kickoff) < new Date()
  );

  let total = 0;
  let correct1X2 = 0;
  let correctOver25 = 0;
  let correctBTTS = 0;

  const recent = [];

  for (const match of finished.slice(0, 120)) {
    const p = predictions.find((x) => x.id === match.id);

    if (!p) continue;

    total++;

    const hg = Number(match.homeGoals ?? 0);
    const ag = Number(match.awayGoals ?? 0);

    const actual1X2 =
      hg > ag ? "Sieg Heim" : hg < ag ? "Sieg Auswärts" : "Unentschieden";

    const actualOver25 = hg + ag >= 3;
    const actualBTTS = hg > 0 && ag > 0;

    const pred1X2 =
      p.homeWin >= p.draw && p.homeWin >= p.awayWin
        ? "Sieg Heim"
        : p.awayWin >= p.homeWin && p.awayWin >= p.draw
        ? "Sieg Auswärts"
        : "Unentschieden";

    const predOver25 = p.over25 >= 50;
    const predBTTS = p.bttsYes >= 50;

    const ok1X2 = pred1X2 === actual1X2;
    const okOver25 = predOver25 === actualOver25;
    const okBTTS = predBTTS === actualBTTS;

    if (ok1X2) correct1X2++;
    if (okOver25) correctOver25++;
    if (okBTTS) correctBTTS++;

    recent.push({
      id: match.id,
      league: match.league?.name ?? "League",
      home: match.homeTeam?.name || match.homeTeamId,
      away: match.awayTeam?.name || match.awayTeamId,
      score: `${hg}:${ag}`,
      pred1X2,
      actual1X2,
      ok1X2,
      okOver25,
      okBTTS,
    });
  }

  const acc1X2 = total ? (correct1X2 / total) * 100 : 0;
  const accOU = total ? (correctOver25 / total) * 100 : 0;
  const accBTTS = total ? (correctBTTS / total) * 100 : 0;

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
            Historische Trefferquote für 1X2, Over/Under 2.5 und Both Teams To Score.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Card label="Analysierte Spiele" value={String(total)} />
            <Card label="1X2 Accuracy" value={pct(acc1X2)} />
            <Card label="Over 2.5 Accuracy" value={pct(accOU)} />
            <Card label="BTTS Accuracy" value={pct(accBTTS)} />
          </div>
        </section>

        <section className="grid gap-4">
          {recent.slice(0, 40).map((r, i) => (
            <article
              key={`${r.id}-${i}`}
              className="glass-card rounded-3xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    {r.league}
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    {r.home} vs {r.away}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Ergebnis: {r.score}
                  </p>
                </div>

                <div
                  className={`rounded-full px-4 py-2 text-sm font-black ${
                    r.ok1X2
                      ? "bg-emerald-400/15 text-emerald-300"
                      : "bg-red-400/15 text-red-300"
                  }`}
                >
                  {r.ok1X2 ? "Correct" : "Wrong"}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <Mini
                  label="1X2"
                  value={r.ok1X2 ? "✓" : "✗"}
                />
                <Mini
                  label="Over 2.5"
                  value={r.okOver25 ? "✓" : "✗"}
                />
                <Mini
                  label="BTTS"
                  value={r.okBTTS ? "✓" : "✗"}
                />
              </div>
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
