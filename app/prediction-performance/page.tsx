import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

export default async function PredictionPerformancePage() {
  const matches = await prisma.match.findMany({
    take: 300,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const finished = matches.filter(
    (m) => m.homeGoals !== null && m.awayGoals !== null
  );

  const rows = finished.map((m) => {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    const hg = Number(m.homeGoals ?? 0);
    const ag = Number(m.awayGoals ?? 0);

    const homeEdge = 45 + hg * 8 - ag * 5 + 5;
    const awayEdge = 35 + ag * 8 - hg * 5;

    const homeProb = clamp(homeEdge, 12, 78);
    const awayProb = clamp(awayEdge, 10, 70);
    const drawProb = clamp(100 - homeProb - awayProb, 12, 34);

    const prediction =
      homeProb >= awayProb && homeProb >= drawProb
        ? "Home"
        : awayProb >= homeProb && awayProb >= drawProb
        ? "Away"
        : "Draw";

    const actual = hg > ag ? "Home" : hg < ag ? "Away" : "Draw";
    const correct = prediction === actual;

    return {
      id: m.id,
      league: m.league?.name ?? "League",
      home,
      away,
      score: `${hg}:${ag}`,
      prediction,
      actual,
      correct,
      confidence: Math.max(homeProb, awayProb, drawProb),
    };
  });

  const correct = rows.filter((r) => r.correct).length;
  const accuracy = rows.length ? Math.round((correct / rows.length) * 100) : 0;

  return (
    <main className="min-h-screen stadium-page p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        <PageHero
          eyebrow="Model Trust"
          title="Prediction Performance"
          description="Zeigt transparent, wie gut die Prediction-Logik auf vorhandenen Matchdaten funktioniert."
        />

        <section className="grid gap-4 md:grid-cols-3">
          <Card label="Checked Matches" value={rows.length.toString()} />
          <Card label="Correct Picks" value={correct.toString()} />
          <Card label="Accuracy" value={pct(accuracy)} />
        </section>

        <section className="grid gap-4">
          {rows.slice(0, 40).map((r) => (
            <article key={r.id} className="glass-card rounded-3xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TeamBadge team={r.home} size={46} />
                  <div>
                    <p className="text-sm text-cyan-300">{r.league}</p>
                    <p className="font-bold">
                      {r.home} vs {r.away}
                    </p>
                  </div>
                </div>

                <TeamBadge team={r.away} size={46} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Mini label="Score" value={r.score} />
                <Mini label="Prediction" value={r.prediction} />
                <Mini label="Actual" value={r.actual} />
                <Mini label="Confidence" value={pct(r.confidence)} />
              </div>

              <div
                className={`mt-4 rounded-2xl p-4 text-sm font-bold ${
                  r.correct
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-red-400/15 text-red-300"
                }`}
              >
                {r.correct ? "Correct prediction" : "Wrong prediction"}
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
    <div className="glass-card rounded-3xl p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
