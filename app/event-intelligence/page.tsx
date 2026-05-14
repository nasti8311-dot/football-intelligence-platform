export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import {
  analyzeEvents,
  buildMomentum,
  buildAdvancedTeamRanking,
  buildSequenceSummary,
  buildTacticalPatterns,
  buildAutomatedInsights,
} from "@/lib/event-intelligence/engine";

export default async function EventIntelligencePage() {
  const events = await prisma.event.findMany({
    orderBy: [{ minute: "asc" }],
    take: 5000,
  });

  const analysis = analyzeEvents(events);
  const ranking = buildAdvancedTeamRanking(events);
  const sequence = buildSequenceSummary(events);
  const tactical = buildTacticalPatterns(events);
  const autoInsights = buildAutomatedInsights(events);
  const momentum = buildMomentum(events);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Quantitative Football Analytics</p>
          <h1 className="text-4xl font-bold">Event Intelligence</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Automatische Auswertung importierter Eventdaten: xThreat,
            progressive Aktionen, Final-Third Entries, Pressure Success und Momentum.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Kpi title="Events" value={events.length.toString()} />
          <Kpi title="Teams" value={analysis.length.toString()} />
          <Kpi
            title="Total xThreat"
            value={analysis
              .reduce((s, t) => s + t.xThreat, 0)
              .toFixed(2)}
          />
          <Kpi
            title="Progressive Actions"
            value={analysis
              .reduce((s, t) => s + t.progressiveActions, 0)
              .toString()}
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="mb-4 text-xl font-semibold">Team Event Intelligence</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="p-3">Team</th>
                  <th className="p-3">Events</th>
                  <th className="p-3">Shots</th>
                  <th className="p-3">Passes</th>
                  <th className="p-3">xG</th>
                  <th className="p-3">xThreat</th>
                  <th className="p-3">Progressive</th>
                  <th className="p-3">Final Third</th>
                  <th className="p-3">Pressure %</th>
		  <th className="p-3">PV</th>
                  <th className="p-3">PVA</th>
                  <th className="p-3">Danger</th>
                  <th className="p-3">IQ Score</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((team) => (
                  <tr key={team.team} className="border-t border-white/10">
                    <td className="p-3 font-semibold text-white">{team.team}</td>
                    <td className="p-3">{team.events}</td>
                    <td className="p-3">{team.shots}</td>
                    <td className="p-3">{team.passes}</td>
                    <td className="p-3 text-cyan-300">{team.xg}</td>
                    <td className="p-3 text-emerald-300">{team.xThreat}</td>
                    <td className="p-3">{team.progressiveActions}</td>
                    <td className="p-3">{team.finalThirdEntries}</td>
                    <td className="p-3">{team.pressureSuccessRate}%</td>
                    <td className="p-3 text-purple-300">{team.possessionValue}</td>
		    <td className="p-3 text-orange-300">{team.passingValueAdded}</td>
                    <td className="p-3">{team.dangerActions}</td>
                    <td className="p-3 font-bold text-cyan-300">{team.intelligenceScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {events.length === 0 && (
            <p className="mt-6 text-slate-400">
              Noch keine Eventdaten importiert. Gehe zu /admin/events und lade eine CSV hoch.
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="mb-4 text-xl font-semibold">Momentum Timeline</h2>

          <div className="space-y-3">
            {momentum.map((m) => (
              <div key={m.minute}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-400">{m.minute} min</span>
                  <span className="text-cyan-300">{m.momentum}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-cyan-400"
                    style={{ width: `${Math.min(100, m.momentum * 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
<section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
  <h2 className="mb-4 text-xl font-semibold">Possession Sequence Intelligence</h2>

  <div className="grid gap-4 md:grid-cols-4">
    <Kpi title="Chains" value={sequence.totalChains.toString()} />
    <Kpi title="Dangerous Chains" value={sequence.dangerousChains.toString()} />
    <Kpi title="Avg Chain Value" value={sequence.averageChainValue.toString()} />
    <Kpi
      title="Best Chain"
      value={sequence.bestChain ? sequence.bestChain.team : "—"}
    />
  </div>

  <div className="mt-6 overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="text-slate-400">
        <tr>
          <th className="p-3">Team</th>
          <th className="p-3">Minute</th>
          <th className="p-3">Events</th>
          <th className="p-3">Value</th>
          <th className="p-3">Progressive</th>
          <th className="p-3">Shots</th>
          <th className="p-3">Danger</th>
        </tr>
      </thead>
      <tbody>
        {sequence.chains.slice(0, 12).map((chain, i) => (
          <tr key={i} className="border-t border-white/10">
            <td className="p-3 font-semibold">{chain.team}</td>
            <td className="p-3">
              {chain.startMinute}-{chain.endMinute}
            </td>
            <td className="p-3">{chain.length}</td>
            <td className="p-3 text-cyan-300">{chain.value}</td>
            <td className="p-3">{chain.progressiveActions}</td>
            <td className="p-3">{chain.shots}</td>
            <td className="p-3">
              {chain.danger ? (
                <span className="rounded-full bg-red-400/20 px-3 py-1 text-red-300">
                  High
                </span>
              ) : (
                <span className="rounded-full bg-slate-700 px-3 py-1 text-slate-300">
                  Normal
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>
<section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
  <h2 className="mb-4 text-xl font-semibold">Tactical Pattern Recognition</h2>

  <div className="grid gap-4 md:grid-cols-3">
    {tactical.insights.map((insight, i) => (
      <div key={i} className="rounded-2xl bg-slate-900 p-4 text-slate-300">
        {insight}
      </div>
    ))}
  </div>

  <div className="mt-6 grid gap-6 md:grid-cols-3">
    <Pattern title="Dominant Zones" items={tactical.dominantZones.map(z => `${z.zone}: ${z.count}`)} />
    <Pattern title="Pressing Triggers" items={tactical.pressingTriggers.map(z => `${z.zone}: ${z.count}`)} />
    <Pattern title="Pass Routes" items={tactical.passRoutes.map(r => `${r.route}: ${r.count}`)} />
  </div>
</section>
<section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-6">
  <p className="text-sm text-cyan-300">Automated Tactical Intelligence</p>
  <h2 className="mt-2 text-2xl font-bold">{autoInsights.headline}</h2>

  <div className="mt-5 grid gap-4 md:grid-cols-2">
    <div className="rounded-2xl bg-slate-950/70 p-5">
      <h3 className="mb-3 font-semibold">AI-style Match Report</h3>
      <div className="space-y-2 text-sm text-slate-300">
        {autoInsights.summary.map((item) => (
          <p key={item}>• {item}</p>
        ))}
      </div>
    </div>

    <div className="rounded-2xl bg-slate-950/70 p-5">
      <h3 className="mb-3 font-semibold">Risk Flags</h3>
      <div className="space-y-2 text-sm text-slate-300">
        {autoInsights.riskFlags.map((item) => (
          <p key={item}>• {item}</p>
        ))}
      </div>
    </div>
  </div>
</section>
      </div>
    </main>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
function Pattern({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="space-y-2 text-sm text-slate-300">
        {items.length > 0 ? (
          items.map((item) => <p key={item}>{item}</p>)
        ) : (
          <p>Keine Daten</p>
        )}
      </div>
    </div>
  );
}
