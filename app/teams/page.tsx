import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { buildLeagueTable } from "@/lib/analytics/team-metrics";

export default async function TeamsPage() {
  const [teams, matches] = await Promise.all([
    prisma.team.findMany({ include: { league: true }, orderBy: [{ elo: "desc" }, { name: "asc" }] }),
    prisma.match.findMany({ include: { homeTeam: true, awayTeam: true, league: true, stats: true }, orderBy: [{ kickoff: "asc" }] }),
  ]);
  const table = buildLeagueTable(matches as any);

  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Link href="/" className="text-sm text-pitch-400 hover:text-pitch-50">← Dashboard</Link>
            <p className="mt-5 text-xs uppercase tracking-[0.35em] text-pitch-400/80">Club Intelligence</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">Team Analytics</h1>
            <p className="mt-4 max-w-2xl text-slate-300">Professionelle Übersicht über importierte Teams, Elo-Stärke, Form, Attack/Defense-Ratings und echte Match-Bilanz aus deiner PostgreSQL-Datenbank.</p>
          </div>
          <Card className="min-w-56">
            <p className="text-sm text-slate-400">Teams importiert</p>
            <p className="mt-1 text-4xl font-semibold text-pitch-400">{teams.length}</p>
          </Card>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-semibold">Power Ranking</h2>
            <p className="mt-1 text-sm text-slate-400">Sortiert nach Punkten, Tordifferenz und Modellstärke.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="px-5 py-4">#</th><th>Team</th><th>Liga</th><th>Sp.</th><th>Bilanz</th><th>TD</th><th>Punkte</th><th>PPG</th><th>Elo</th><th>Form</th><th></th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(table.length ? table : teams.map((t) => ({ teamId: t.id, teamName: t.name, played: 0, wins: 0, draws: 0, losses: 0, goalDifference: 0, points: 0, ppg: 0, elo: t.elo, form: t.form }))).map((row, i) => {
                  const team = teams.find((t) => t.id === row.teamId);
                  return (
                    <tr key={row.teamId} className="hover:bg-white/[0.035]">
                      <td className="px-5 py-4 text-slate-500">{i + 1}</td>
                      <td className="font-medium text-white">{row.teamName}</td>
                      <td className="text-slate-400">{team?.league?.name ?? "—"}</td>
                      <td>{row.played}</td>
                      <td>{row.wins}-{row.draws}-{row.losses}</td>
                      <td className={row.goalDifference >= 0 ? "text-pitch-400" : "text-rose-300"}>{row.goalDifference}</td>
                      <td className="font-semibold">{row.points}</td>
                      <td>{row.ppg.toFixed(2)}</td>
                      <td>{row.elo}</td>
                      <td>{(row.form * 100).toFixed(0)}%</td>
                      <td className="pr-5"><Link className="rounded-full border border-pitch-400/40 px-3 py-1 text-xs text-pitch-400 hover:bg-pitch-400/10" href={`/teams/${row.teamId}`}>Analyse</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
