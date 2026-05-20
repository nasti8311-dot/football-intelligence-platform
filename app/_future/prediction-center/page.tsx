import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PredictionCenterPage() {
  const matches = await prisma.match.findMany({
    take: 30,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const predictions = matches.map((m) => {
    const homeStrength =
      50 + Number(m.homeGoals ?? 0) * 8 - Number(m.awayGoals ?? 0) * 4;

    const awayStrength =
      50 + Number(m.awayGoals ?? 0) * 8 - Number(m.homeGoals ?? 0) * 4;

    const homeWin = Math.max(5, Math.min(85, homeStrength));
    const awayWin = Math.max(5, Math.min(85, awayStrength));
    const draw = Math.max(10, 100 - homeWin - awayWin);

    return {
      match: m,
      homeWin,
      draw,
      awayWin,
      confidence: Math.round(Math.max(homeWin, awayWin, draw)),
    };
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Prediction Intelligence</p>
          <h1 className="text-5xl font-bold">Prediction Center</h1>
          <p className="mt-3 text-slate-400">
            Matchwahrscheinlichkeiten aus Teamstärke, Ergebnisdaten und Formsignalen.
          </p>
        </section>

        <section className="grid gap-5">
          {predictions.map((p) => (
            <div
              key={p.match.id}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-cyan-300">
                    {p.match.league?.name ?? "League"} ·{" "}
                    {p.match.kickoff
  ? new Date(p.match.kickoff).toLocaleDateString("de-DE")
  : "No date"}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {p.match.homeTeam?.name ?? p.match.homeTeamId} vs{" "}
                    {p.match.awayTeam?.name ?? p.match.awayTeamId}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Result: {p.match.homeGoals ?? "-"} : {p.match.awayGoals ?? "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-400/10 px-5 py-3 text-right">
                  <p className="text-sm text-emerald-300">Confidence</p>
                  <p className="text-3xl font-black text-emerald-300">
                    {p.confidence}%
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Prob label="Home Win" value={p.homeWin} />
                <Prob label="Draw" value={p.draw} />
                <Prob label="Away Win" value={p.awayWin} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Prob({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-cyan-300">{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-slate-800">
        <div className="h-3 rounded-full bg-cyan-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
