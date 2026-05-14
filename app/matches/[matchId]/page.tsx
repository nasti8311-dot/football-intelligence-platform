import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { OutcomeBars, TeamComparisonChart, TopScoreChart } from "@/components/analytics/match-intelligence-charts";
import { ScenarioProbabilityChart, SimulationOutcomeChart } from "@/components/analytics/prediction-v2-charts";
import { buildScenarioBuckets, deriveValuePicks, predictFromDbTeams } from "@/lib/analytics/match-intelligence";
import { enrichValuePicksWithSimulation, runMonteCarloSimulation } from "@/lib/model/monte-carlo";

function pct(value: number) { return `${(value * 100).toFixed(1)}%`; }
function odds(value: number) { return value.toFixed(2); }

export default async function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true, league: true, stats: true, odds: true },
  });
  if (!match) notFound();

  const prediction = predictFromDbTeams(match.homeTeam, match.awayTeam, match.league?.name);
  const scenarios = buildScenarioBuckets(prediction.scoreMatrix);
  const simulation = runMonteCarloSimulation({ expectedHomeGoals: prediction.expectedGoals.home, expectedAwayGoals: prediction.expectedGoals.away, seed: match.id, iterations: 20000 });
  const values = enrichValuePicksWithSimulation(deriveValuePicks(match as any, prediction), simulation);
  const outcomeData = [
    { name: "Home", probability: prediction.outcomes.homeWin },
    { name: "Draw", probability: prediction.outcomes.draw },
    { name: "Away", probability: prediction.outcomes.awayWin },
  ];
  const scoreData = prediction.topScores.map((s) => ({ score: `${s.homeGoals}-${s.awayGoals}`, probability: s.probability }));
  const comparisonData = [
    { metric: "Attack", home: match.homeTeam.attack, away: match.awayTeam.attack },
    { metric: "Defense", home: match.homeTeam.defense, away: match.awayTeam.defense },
    { metric: "Form", home: match.homeTeam.form, away: match.awayTeam.form },
    { metric: "xG For", home: match.homeTeam.xgFor, away: match.awayTeam.xgFor },
    { metric: "xG Against", home: match.homeTeam.xgAgainst, away: match.awayTeam.xgAgainst },
  ];

  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/matches" className="text-sm text-pitch-400 hover:text-pitch-50">← Match Explorer</Link>
          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-pitch-400/80">Match Lab</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">{match.homeTeam.name} <span className="text-slate-500">vs</span> {match.awayTeam.name}</h1>
          <p className="mt-3 text-slate-400">{match.league?.name ?? "Importierte Liga"} · {match.kickoff ? match.kickoff.toISOString().slice(0, 10) : "kein Datum"} · Ergebnis {match.homeGoals ?? "—"}:{match.awayGoals ?? "—"}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><p className="text-sm text-slate-400">Home xG</p><p className="mt-2 text-4xl font-semibold text-pitch-400">{prediction.expectedGoals.home.toFixed(2)}</p></Card>
          <Card><p className="text-sm text-slate-400">Away xG</p><p className="mt-2 text-4xl font-semibold text-pitch-400">{prediction.expectedGoals.away.toFixed(2)}</p></Card>
          <Card><p className="text-sm text-slate-400">Home Win</p><p className="mt-2 text-4xl font-semibold">{pct(prediction.outcomes.homeWin)}</p></Card>
          <Card><p className="text-sm text-slate-400">Fair Odds Home</p><p className="mt-2 text-4xl font-semibold">{odds(1 / prediction.outcomes.homeWin)}</p></Card>
          <Card><p className="text-sm text-slate-400">MC Confidence</p><p className="mt-2 text-4xl font-semibold text-pitch-400">{pct(simulation.riskProfile.confidence)}</p></Card>
          <Card><p className="text-sm text-slate-400">Volatility</p><p className="mt-2 text-4xl font-semibold">{pct(simulation.riskProfile.volatility)}</p></Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SimulationOutcomeChart data={[
            { name: "Home", poisson: prediction.outcomes.homeWin, simulation: simulation.simulatedOutcomes.homeWin, low: simulation.confidenceBands.homeWin[0], high: simulation.confidenceBands.homeWin[1] },
            { name: "Draw", poisson: prediction.outcomes.draw, simulation: simulation.simulatedOutcomes.draw, low: simulation.confidenceBands.draw[0], high: simulation.confidenceBands.draw[1] },
            { name: "Away", poisson: prediction.outcomes.awayWin, simulation: simulation.simulatedOutcomes.awayWin, low: simulation.confidenceBands.awayWin[0], high: simulation.confidenceBands.awayWin[1] },
          ]} />
          <ScenarioProbabilityChart data={simulation.buckets.map((b) => ({ label: b.label, probability: b.probability }))} />
          <OutcomeBars data={outcomeData} />
          <TopScoreChart data={scoreData} />
          <TeamComparisonChart data={comparisonData} />
          <Card>
            <h3 className="text-lg font-semibold">Scenario Buckets</h3>
            <p className="mt-1 text-sm text-slate-400">Verdichtete Spielbilder aus allen Scoreline-Wahrscheinlichkeiten.</p>
            <div className="mt-5 space-y-4">
              {scenarios.map((scenario) => (
                <div key={scenario.label}>
                  <div className="mb-1 flex justify-between text-sm"><span>{scenario.label}</span><span className="text-pitch-400">{pct(scenario.probability)}</span></div>
                  <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-pitch-400" style={{ width: `${scenario.probability * 100}%` }} /></div>
                  <p className="mt-1 text-xs text-slate-500">{scenario.explanation}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">Value-Bet Intelligence</h3>
            <p className="mt-1 text-sm text-slate-400">Vergleicht Modellwahrscheinlichkeit mit importierten Buchmacherquoten. Kein Zufall, keine Garantie — nur mathematisches Edge-Signal.</p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400"><tr><th>Markt</th><th>Modell</th><th>Sim</th><th>Fair</th><th>Odds</th><th>Risk Edge</th><th>Kelly</th></tr></thead>
                <tbody className="divide-y divide-white/10">
                  {values.length ? values.map((v) => (
                    <tr key={v.market}><td className="py-3">{v.market}</td><td>{pct(v.modelProbability)}</td><td>{pct(v.simulatedProbability)}</td><td>{odds(v.fairOdds)}</td><td>{odds(v.offeredOdds)}</td><td className={v.riskAdjustedEdge > 0 ? "text-pitch-400" : "text-rose-300"}>{v.riskAdjustedEdge > 0 ? "+" : ""}{pct(v.riskAdjustedEdge)}</td><td>{pct(v.kellyFraction)}</td></tr>
                  )) : <tr><td className="py-4 text-slate-500" colSpan={7}>Keine Quoten in dieser CSV vorhanden.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Model Inspector</h3>
            <p className="mt-1 text-sm text-slate-400">Nachvollziehbare Multiplikatoren für die Expected-Goals-Berechnung.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-3 font-medium">{match.homeTeam.shortName}</p>
                {Object.entries(prediction.breakdown.home).map(([k, v]) => <div key={k} className="flex justify-between border-b border-white/10 py-2 text-sm"><span className="text-slate-400">{k}</span><span>{Number(v).toFixed(3)}</span></div>)}
              </div>
              <div>
                <p className="mb-3 font-medium">{match.awayTeam.shortName}</p>
                {Object.entries(prediction.breakdown.away).map(([k, v]) => <div key={k} className="flex justify-between border-b border-white/10 py-2 text-sm"><span className="text-slate-400">{k}</span><span>{Number(v).toFixed(3)}</span></div>)}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
