import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { predictFromDbTeams, deriveValuePicks } from "@/lib/analytics/match-intelligence";

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true, league: true, stats: true, odds: true },
    orderBy: [{ kickoff: "desc" }],
    take: 80,
  });

  const rows = matches.map((match) => {
    const prediction = predictFromDbTeams(match.homeTeam, match.awayTeam, match.league?.name);
    const values = deriveValuePicks(match as any, prediction);
    return { match, prediction, bestValue: values[0] };
  });

  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Link href="/" className="text-sm text-pitch-400 hover:text-pitch-50">← Dashboard</Link>
            <p className="mt-5 text-xs uppercase tracking-[0.35em] text-pitch-400/80">Match Intelligence</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">Match Explorer</h1>
            <p className="mt-4 max-w-2xl text-slate-300">Alle importierten Spiele mit modellbasierter 1X2-Prognose, xG-Erwartung, Quotenvergleich und Value-Signal.</p>
          </div>
          <Card className="min-w-56">
            <p className="text-sm text-slate-400">Matches analysiert</p>
            <p className="mt-1 text-4xl font-semibold text-pitch-400">{rows.length}</p>
          </Card>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-semibold">Prediction Board</h2>
            <p className="mt-1 text-sm text-slate-400">Sortiert nach zuletzt importierten Spielen. Jeder Eintrag öffnet eine vollständige Match-Analyse.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Datum</th><th>Liga</th><th>Match</th><th>Ergebnis</th><th>xG Home</th><th>xG Away</th><th>H</th><th>X</th><th>A</th><th>Best Value</th><th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.map(({ match, prediction, bestValue }) => (
                  <tr key={match.id} className="hover:bg-white/[0.035]">
                    <td className="px-5 py-4 text-slate-400">{match.kickoff ? match.kickoff.toISOString().slice(0, 10) : "—"}</td>
                    <td className="text-slate-400">{match.league?.name ?? "—"}</td>
                    <td className="font-medium">{match.homeTeam.name} <span className="text-slate-500">vs</span> {match.awayTeam.name}</td>
                    <td>{match.homeGoals ?? "—"}:{match.awayGoals ?? "—"}</td>
                    <td className="text-pitch-400">{prediction.expectedGoals.home.toFixed(2)}</td>
                    <td className="text-pitch-400">{prediction.expectedGoals.away.toFixed(2)}</td>
                    <td>{pct(prediction.outcomes.homeWin)}</td>
                    <td>{pct(prediction.outcomes.draw)}</td>
                    <td>{pct(prediction.outcomes.awayWin)}</td>
                    <td>{bestValue ? <span className={bestValue.edge > 0 ? "text-pitch-400" : "text-slate-400"}>{bestValue.market} {bestValue.edge > 0 ? `+${pct(bestValue.edge)}` : pct(bestValue.edge)}</span> : <span className="text-slate-500">keine Odds</span>}</td>
                    <td className="pr-5"><Link className="rounded-full border border-pitch-400/40 px-3 py-1 text-xs text-pitch-400 hover:bg-pitch-400/10" href={`/matches/${match.id}`}>Analyse</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
