import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { cumulativeSeries, summarizeTeam, toTeamRows } from "@/lib/analytics/team-metrics";
import { TeamTrendCharts } from "@/components/analytics/team-charts";

export default async function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { league: true } });
  if (!team) notFound();

  const matches = await prisma.match.findMany({
    where: { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
    include: { homeTeam: true, awayTeam: true, league: true, stats: true },
    orderBy: [{ kickoff: "asc" }, { createdAt: "asc" }],
  });

  const rows = toTeamRows(teamId, matches as any);
  const summary = summarizeTeam(rows);
  const series = cumulativeSeries(rows);
  const radar = [
    { metric: "Attack", value: Math.min(100, team.attack * 50), fullMark: 100 },
    { metric: "Defense", value: Math.min(100, Math.max(0, (2.2 - team.defense) * 45)), fullMark: 100 },
    { metric: "Elo", value: Math.min(100, Math.max(0, (team.elo - 1200) / 6)), fullMark: 100 },
    { metric: "Form", value: Math.min(100, team.form * 100), fullMark: 100 },
    { metric: "xG+", value: Math.min(100, team.xgFor * 42), fullMark: 100 },
    { metric: "xGA", value: Math.min(100, Math.max(0, (2.4 - team.xgAgainst) * 40)), fullMark: 100 },
  ];

  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/teams" className="text-sm text-pitch-400 hover:text-pitch-50">← Team Analytics</Link>
          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-pitch-400/80">Team Detail</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">{team.name}</h1>
          <p className="mt-3 text-slate-300">{team.league?.name ?? "Liga unbekannt"} · Elo {team.elo} · Form {(team.form * 100).toFixed(0)}%</p>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card><p className="text-sm text-slate-400">Punkte</p><p className="mt-2 text-3xl font-semibold text-pitch-400">{summary.points}</p><p className="text-xs text-slate-500">{summary.ppg.toFixed(2)} pro Spiel</p></Card>
          <Card><p className="text-sm text-slate-400">Bilanz</p><p className="mt-2 text-3xl font-semibold">{summary.wins}-{summary.draws}-{summary.losses}</p><p className="text-xs text-slate-500">{summary.played} Spiele</p></Card>
          <Card><p className="text-sm text-slate-400">Tordifferenz</p><p className="mt-2 text-3xl font-semibold">{summary.goalDifference}</p><p className="text-xs text-slate-500">{summary.goalsFor}:{summary.goalsAgainst} Tore</p></Card>
          <Card><p className="text-sm text-slate-400">xG-Differenz</p><p className="mt-2 text-3xl font-semibold text-sky-300">{summary.xgDifference}</p><p className="text-xs text-slate-500">{summary.xgFor}:{summary.xgAgainst} xG</p></Card>
          <Card><p className="text-sm text-slate-400">Modellrating</p><p className="mt-2 text-3xl font-semibold">{team.elo}</p><p className="text-xs text-slate-500">Elo-basiert</p></Card>
        </div>

        <TeamTrendCharts series={series} radar={radar} splits={[{ name: "Home", points: summary.homePoints }, { name: "Away", points: summary.awayPoints }]} />

        <Card className="mt-5 overflow-hidden p-0">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-semibold">Match History</h2>
            <p className="mt-1 text-sm text-slate-400">Alle importierten Spiele mit Ergebnis, xG-Proxy und Shot-Daten.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="px-5 py-4">Datum</th><th>Gegner</th><th>Ort</th><th>Ergebnis</th><th>xG</th><th>Shots</th><th>Punkte</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.slice().reverse().map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.035]">
                    <td className="px-5 py-4 text-slate-400">{r.date}</td>
                    <td className="font-medium">{r.opponent}</td>
                    <td><span className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300">{r.venue}</span></td>
                    <td><span className={r.result === "W" ? "text-pitch-400" : r.result === "D" ? "text-amber-300" : "text-rose-300"}>{r.result}</span> · {r.gf}:{r.ga}</td>
                    <td>{r.xgFor.toFixed(2)} : {r.xgAgainst.toFixed(2)}</td>
                    <td>{r.shotsFor ?? "—"} : {r.shotsAgainst ?? "—"}</td>
                    <td>{r.points}</td>
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
