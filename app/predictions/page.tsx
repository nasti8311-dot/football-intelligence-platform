import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { predictFromDbTeams, deriveValuePicks } from "@/lib/analytics/match-intelligence";
import { enrichValuePicksWithSimulation, runMonteCarloSimulation } from "@/lib/model/monte-carlo";
import { ScenarioProbabilityChart, ScoreDistributionLine, SimulationOutcomeChart } from "@/components/analytics/prediction-v2-charts";

function pct(value: number) { return `${(value * 100).toFixed(1)}%`; }
function odds(value: number) { return value.toFixed(2); }

function distributionByGoals(scores: { homeGoals: number; awayGoals: number; probability: number }[]) {
  return Array.from({ length: 8 }, (_, goals) => ({
    goals: String(goals),
    home: scores.filter((s) => s.homeGoals === goals).reduce((sum, s) => sum + s.probability, 0),
    away: scores.filter((s) => s.awayGoals === goals).reduce((sum, s) => sum + s.probability, 0),
  }));
}

export default async function PredictionV2Page() {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true, league: true, stats: true, odds: true },
    orderBy: [{ kickoff: "desc" }],
    take: 40,
  });

  const analysed = matches.map((match) => {
    const prediction = predictFromDbTeams(match.homeTeam, match.awayTeam, match.league?.name);
    const simulation = runMonteCarloSimulation({
      expectedHomeGoals: prediction.expectedGoals.home,
      expectedAwayGoals: prediction.expectedGoals.away,
      seed: match.id,
      iterations: 20000,
    });
    const valuePicks = enrichValuePicksWithSimulation(deriveValuePicks(match as any, prediction), simulation);
    return { match, prediction, simulation, valuePicks };
  }).sort((a, b) => b.simulation.riskProfile.confidence - a.simulation.riskProfile.confidence);

  const featured = analysed[0];

  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Link href="/" className="text-sm text-pitch-400 hover:text-pitch-50">← Dashboard</Link>
            <p className="mt-5 text-xs uppercase tracking-[0.35em] text-pitch-400/80">Prediction Engine v2</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">Monte-Carlo Match Lab</h1>
            <p className="mt-4 max-w-3xl text-slate-300">Professionelle Zukunftsanalyse aus Elo, Form, Attack/Defense, xG-Proxy, Poisson und 20.000 deterministischen Simulationen pro Match.</p>
          </div>
          <Card className="min-w-64">
            <p className="text-sm text-slate-400">Simulationen</p>
            <p className="mt-1 text-4xl font-semibold text-pitch-400">{(analysed.length * 20000).toLocaleString("de-DE")}</p>
            <p className="mt-1 text-xs text-slate-500">über {analysed.length} Matches</p>
          </Card>
        </div>

        {featured ? (
          <>
            <div className="grid gap-4 md:grid-cols-5">
              <Card className="md:col-span-2">
                <p className="text-sm text-slate-400">Top Model Lean</p>
                <h2 className="mt-2 text-2xl font-semibold">{featured.match.homeTeam.name} <span className="text-slate-500">vs</span> {featured.match.awayTeam.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{featured.match.league?.name ?? "Importierte Liga"} · {featured.match.kickoff ? featured.match.kickoff.toISOString().slice(0, 10) : "kein Datum"}</p>
              </Card>
              <Card><p className="text-sm text-slate-400">Confidence</p><p className="mt-2 text-4xl font-semibold text-pitch-400">{pct(featured.simulation.riskProfile.confidence)}</p></Card>
              <Card><p className="text-sm text-slate-400">Volatility</p><p className="mt-2 text-4xl font-semibold">{pct(featured.simulation.riskProfile.volatility)}</p></Card>
              <Card><p className="text-sm text-slate-400">Stance</p><p className="mt-2 text-xl font-semibold text-pitch-400">{featured.simulation.riskProfile.recommendedStance}</p></Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <SimulationOutcomeChart data={[
                { name: "Home", poisson: featured.prediction.outcomes.homeWin, simulation: featured.simulation.simulatedOutcomes.homeWin, low: featured.simulation.confidenceBands.homeWin[0], high: featured.simulation.confidenceBands.homeWin[1] },
                { name: "Draw", poisson: featured.prediction.outcomes.draw, simulation: featured.simulation.simulatedOutcomes.draw, low: featured.simulation.confidenceBands.draw[0], high: featured.simulation.confidenceBands.draw[1] },
                { name: "Away", poisson: featured.prediction.outcomes.awayWin, simulation: featured.simulation.simulatedOutcomes.awayWin, low: featured.simulation.confidenceBands.awayWin[0], high: featured.simulation.confidenceBands.awayWin[1] },
              ]} />
              <ScenarioProbabilityChart data={featured.simulation.buckets.map((b) => ({ label: b.label, probability: b.probability }))} />
              <ScoreDistributionLine data={distributionByGoals(featured.simulation.exactScores)} />
              <Card>
                <h3 className="text-lg font-semibold">Risk & Value Summary</h3>
                <p className="mt-1 text-sm text-slate-400">Risk-adjusted Edges kombinieren Value Signal, Simulation-Stabilität und Match-Volatilität.</p>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-400">Risk Profile</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{featured.simulation.riskProfile.explanation}</p>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                      <div><p className="text-slate-500">Upset Risk</p><p className="font-semibold">{pct(featured.simulation.riskProfile.upsetRisk)}</p></div>
                      <div><p className="text-slate-500">Draw Risk</p><p className="font-semibold">{pct(featured.simulation.riskProfile.drawRisk)}</p></div>
                      <div><p className="text-slate-500">Goal Spread</p><p className="font-semibold">{featured.simulation.goalSpread.toFixed(2)}</p></div>
                    </div>
                  </div>
                  {featured.valuePicks.length ? featured.valuePicks.slice(0, 3).map((pick) => (
                    <div key={pick.market} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                      <div><p className="font-semibold">{pick.market}</p><p className="text-slate-400">Odds {odds(pick.offeredOdds)} · Fair {odds(pick.fairOdds)}</p></div>
                      <div className={pick.riskAdjustedEdge > 0 ? "text-right text-pitch-400" : "text-right text-rose-300"}>
                        <p className="font-semibold">{pick.riskAdjustedEdge > 0 ? "+" : ""}{pct(pick.riskAdjustedEdge)}</p>
                        <p className="text-xs text-slate-500">risk-adjusted</p>
                      </div>
                    </div>
                  )) : <p className="text-sm text-slate-500">Keine Buchmacherquoten in diesem Match vorhanden.</p>}
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <h2 className="text-xl font-semibold">Noch keine Matches vorhanden</h2>
            <p className="mt-2 text-slate-400">Importiere zuerst Football-Data CSVs unter /admin/import.</p>
          </Card>
        )}

        <Card className="mt-6 overflow-hidden p-0">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-semibold">Prediction Board v2</h2>
            <p className="mt-1 text-sm text-slate-400">Sortiert nach Confidence. Nutze es als Liste möglicher zukünftiger Spielanalysen.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="px-5 py-4">Datum</th><th>Liga</th><th>Match</th><th>xG</th><th>Sim H</th><th>Sim X</th><th>Sim A</th><th>Confidence</th><th>Volatility</th><th>Stance</th><th>Best Edge</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {analysed.map(({ match, prediction, simulation, valuePicks }) => {
                  const bestEdge = valuePicks[0];
                  return (
                    <tr key={match.id} className="hover:bg-white/[0.035]">
                      <td className="px-5 py-4 text-slate-400">{match.kickoff ? match.kickoff.toISOString().slice(0, 10) : "—"}</td>
                      <td className="text-slate-400">{match.league?.name ?? "—"}</td>
                      <td className="font-medium"><Link href={`/matches/${match.id}`} className="hover:text-pitch-400">{match.homeTeam.name} <span className="text-slate-500">vs</span> {match.awayTeam.name}</Link></td>
                      <td className="text-pitch-400">{prediction.expectedGoals.home.toFixed(2)} : {prediction.expectedGoals.away.toFixed(2)}</td>
                      <td>{pct(simulation.simulatedOutcomes.homeWin)}</td>
                      <td>{pct(simulation.simulatedOutcomes.draw)}</td>
                      <td>{pct(simulation.simulatedOutcomes.awayWin)}</td>
                      <td className="text-pitch-400">{pct(simulation.riskProfile.confidence)}</td>
                      <td>{pct(simulation.riskProfile.volatility)}</td>
                      <td>{simulation.riskProfile.recommendedStance}</td>
                      <td>{bestEdge ? <span className={bestEdge.riskAdjustedEdge > 0 ? "text-pitch-400" : "text-rose-300"}>{bestEdge.market} {bestEdge.riskAdjustedEdge > 0 ? "+" : ""}{pct(bestEdge.riskAdjustedEdge)}</span> : <span className="text-slate-500">keine Odds</span>}</td>
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
