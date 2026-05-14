"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, BarChart3, BrainCircuit, DatabaseZap, ShieldCheck, TrendingUp } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { teams } from "@/data/teams";
import { predictMatch } from "@/lib/model/prediction";
import { decimal, percent } from "@/lib/utils/format";
import { KpiCard } from "./kpi-card";
import { MarketPanel } from "./market-panel";
import { ModelBreakdown } from "./model-breakdown";
import { ModelPanel } from "./model-panel";
import { ProbabilityChart } from "./probability-chart";
import { ScoreMatrix } from "./score-matrix";
import { TeamRadar } from "./team-radar";
import { TeamSelector } from "./team-selector";
import { TopScores } from "./top-scores";

export function Dashboard() {
  const [homeTeamId, setHomeTeamId] = useState("mci");
  const [awayTeamId, setAwayTeamId] = useState("rma");

  const prediction = useMemo(() => predictMatch({ homeTeamId, awayTeamId }), [homeTeamId, awayTeamId]);
  const mostLikely = prediction.topScores[0];

  const chartData = [
    { name: "Heimsieg", probability: prediction.outcomes.homeWin },
    { name: "Remis", probability: prediction.outcomes.draw },
    { name: "Auswärtssieg", probability: prediction.outcomes.awayWin },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900">
      <div className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-[0.16]" />
      <div className="absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-pitch-400/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 py-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pitch-400/20 bg-pitch-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-pitch-400">
              <BrainCircuit size={14} /> Apex Football Intelligence
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
              Professionelles Sports-Analytics Dashboard für Match-Prognosen, xG und Marktanalyse.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Deterministisches Modell aus Poisson-Scoregrid, Elo-Teamstärke, xG-Signal, Formkurve und Home/Away Adjustment. Saubere SaaS-Architektur mit API Route und austauschbarem Data Provider.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl">
              <StatIcon icon={<Activity size={18} />} label="xG" />
              <StatIcon icon={<ShieldCheck size={18} />} label="Elo" />
              <StatIcon icon={<DatabaseZap size={18} />} label="API Ready" />
            </div>
            <Link href="/teams" className="rounded-2xl border border-pitch-400/30 bg-pitch-400/10 px-5 py-3 text-center text-sm font-medium text-pitch-400 hover:bg-pitch-400/15">Team Analytics öffnen</Link>
            <Link href="/matches" className="rounded-2xl border border-pitch-400/30 bg-pitch-400/10 px-5 py-3 text-center text-sm font-medium text-pitch-400 hover:bg-pitch-400/15">Match Explorer öffnen</Link>
            <Link href="/admin/import" className="rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-3 text-center text-sm font-medium text-slate-300 hover:bg-white/[0.07]">CSV Import</Link>
          </div>
        </header>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-glow backdrop-blur-2xl md:p-6">
          <TeamSelector teams={teams} homeTeamId={homeTeamId} awayTeamId={awayTeamId} onHomeChange={setHomeTeamId} onAwayChange={setAwayTeamId} />
        </motion.section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <KpiCard label={`${prediction.homeTeam.shortName} xG`} value={decimal(prediction.expectedGoals.home)} detail={`${prediction.homeTeam.name} erwartete Tore`} accent />
          <KpiCard label={`${prediction.awayTeam.shortName} xG`} value={decimal(prediction.expectedGoals.away)} detail={`${prediction.awayTeam.name} erwartete Tore`} />
          <KpiCard label="Heimsieg" value={percent(prediction.outcomes.homeWin)} detail="Scorelines mit Heimtore > Auswärtstore" />
          <KpiCard label="Remis" value={percent(prediction.outcomes.draw)} detail="Diagonalwerte der Score-Matrix" />
          <KpiCard label="Top Score" value={`${mostLikely.homeGoals}:${mostLikely.awayGoals}`} detail={`${percent(mostLikely.probability)} wahrscheinlichster exakter Spielstand`} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <ProbabilityChart data={chartData} />
          <TopScores scores={prediction.topScores} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <TeamRadar home={prediction.homeTeam} away={prediction.awayTeam} />
          <MarketPanel markets={prediction.markets} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_.85fr]">
          <ScoreMatrix matrix={prediction.scoreMatrix} maxGoals={prediction.config.maxGoals} />
          <ModelBreakdown prediction={prediction} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <ModelPanel notes={prediction.modelNotes} />
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-card backdrop-blur-xl">
            <div className="flex items-center gap-2 text-pitch-400"><TrendingUp size={18} /><span className="text-xs uppercase tracking-[0.22em]">SaaS Roadmap Ready</span></div>
            <h2 className="mt-4 text-lg font-semibold text-white">Erweiterungspunkte</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ["API", "POST /api/predict liefert dieselbe Prognose als JSON für spätere Frontends oder mobile Apps."],
                ["Data Layer", "StaticTeamProvider kann durch ApiTeamProvider mit Football-Data, StatsBomb, Opta oder eigenem Backend ersetzt werden."],
                ["ML Ensemble", "Ein ML-Modell kann als Kalibrierungs- oder Feature-Layer parallel zum deterministischen Modell ergänzt werden."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-medium text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatIcon({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300">
      <span className="text-pitch-400">{icon}</span>
      {label}
    </div>
  );
}
