import Link from "next/link";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";
import PremiumPickCard from "@/components/picks/PremiumPickCard";
import CleanMatchCard from "@/components/picks/CleanMatchCard";
import SavePickButton from "@/components/picks/SavePickButton";
import PremiumHero from "@/components/PremiumHero";
import GrowthCTA from "@/components/GrowthCTA";
import { filterRiskControlledPicks } from "@/lib/risk-control";
import { buildPredictions } from "@/lib/predictions";
import { premiumAdjustPredictions } from "@/lib/premium-model";
import { advancedTune } from "@/lib/advanced-tuning";
import { filterElitePicks, rankElitePicks } from "@/lib/pick-quality";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${Math.round(v)}%`;
}

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function DailyPicksPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="min-h-screen stadium-page px-4 pb-28 pt-6 text-white md:px-6">
        <div className="mx-auto max-w-4xl">

        {picks.length === 0 ? (
          <section className="glass-card rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-black">Keine Picks gefunden</h2>
            <p className="mt-3 text-slate-300">
              Synchronisiere Fixtures oder prüfe deine Datenquelle.
            </p>
          </section>
        ) : (
          <section className="grid gap-5">
            {picks.map((p, index) => {
              const isToday = p.kickoff && dateKey(new Date(p.kickoff)) === today;

              return (
                <div key={p.id} className="space-y-4">
                  {/* Premium visual card */}
                  <CleanMatchCard p={p} />

                  <article className="glass-card rounded-[2rem] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                        #{index + 1} · {p.league}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {p.kickoff
                          ? new Date(p.kickoff).toLocaleDateString("de-DE")
                          : "No date"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {p.recommendation === "Elite" && (
                        <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">
                          ELITE PICK
                        </span>
                      )}

                      {p.recommendation === "Premium" && (
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
                          PREMIUM+
                        </span>
                      )}

                      {p.premiumTier === "Premium" && (
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
                          PREMIUM PICK
                        </span>
                      )}

                      {p.premiumTier === "Strong" && (
                        <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-300">
                          STRONG PICK
                        </span>
                      )}

                      {!isToday && (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                          Next
                        </span>
                      )}
                      {p.edge !== null && p.edge !== undefined && p.edge >= 6 && (
                        <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-300">
                          SHARP VALUE +{p.edge.toFixed(1)}%
                        </span>
                      )}

                      {(p.edge === null || p.edge === undefined) && p.valueScore >= 10 && (
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
                          MODEL EDGE
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          p.confidence === "High"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : p.confidence === "Medium"
                            ? "bg-yellow-400/15 text-yellow-300"
                            : "bg-red-400/15 text-red-300"
                        }`}
                      >
                        {p.confidence}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <Link
                      href={`/team-form?team=${encodeURIComponent(p.home)}`}
                      className="flex flex-1 flex-col items-center text-center"
                    >
                      <TeamBadge team={p.home} size={66} />
                      <p className="mt-3 text-sm font-black">{p.home}</p>
                      <p className="mt-1 text-[11px] text-cyan-300">
                        Form ansehen
                      </p>
                    </Link>

                    <div className="text-center">
                      <p className="text-xs text-slate-500">Top Pick</p>
                      <p className="mt-1 text-4xl font-black text-cyan-300">
                        {pct(p.bestProbability)}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-300">
                        {p.bestMarket}
                      </p>
                    </div>

                    <Link
                      href={`/team-form?team=${encodeURIComponent(p.away)}`}
                      className="flex flex-1 flex-col items-center text-center"
                    >
                      <TeamBadge team={p.away} size={66} />
                      <p className="mt-3 text-sm font-black">{p.away}</p>
                      <p className="mt-1 text-[11px] text-cyan-300">
                        Form ansehen
                      </p>
                    </Link>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                    <div className="rounded-2xl bg-slate-950/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Risk Profile
                      </p>
                      <p className={`mt-1 text-sm font-black ${
                        p.confidence === "High"
                          ? "text-emerald-300"
                          : p.confidence === "Medium"
                          ? "text-yellow-300"
                          : "text-red-300"
                      }`}>
                        {p.confidence}
                      </p>

                      {(p.injuryPenalty || 0) > 0.08 && (
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">
                          Risk adjusted
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl bg-slate-950/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Prediction Details
                      </p>
                      <p className="mt-1 text-sm font-black text-cyan-300">
                        {p.bestMarket}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Probability
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        {Math.round(p.bestProbability)}%
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Expected Goals
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        {p.homeXg.toFixed(1)} : {p.awayXg.toFixed(1)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Tracking
                      </p>
                      <p className="mt-1 text-sm font-black text-emerald-300">
                        LIVE
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <Market label="1" value={pct(p.homeWin)} tone="cyan" />
                    <Market label="X" value={pct(p.draw)} tone="slate" />
                    <Market label="2" value={pct(p.awayWin)} tone="cyan" />
                    <Market label="Over 2.5" value={pct(p.over25)} tone="green" />
                    <Market label="Under 2.5" value={pct(p.under25)} tone="blue" />
                    <Market label="BTTS" value={pct(p.bttsYes)} tone="pink" />
                  </div>

                  {p.injurySignals && p.injurySignals.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-red-400/10 bg-red-400/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
                        Squad Signals
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.injurySignals.map((trend: string) => (
                          <span
                            key={trend}
                            className="rounded-full bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-200"
                          >
                            {trend}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.trends && p.trends.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                        Trend Signals
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.trends.map((trend: string) => (
                          <span
                            key={trend}
                            className="rounded-full bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-200"
                          >
                            {trend}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                      Match Insight
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-200">{p.reason}</p>

                    {p.summary && (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                          Model Summary
                        </p>

                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {p.summary}
                        </p>
                      </div>
                    )}

                    {(p.marketCalibration || p.leagueCalibration) && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {p.marketCalibration && (
                          <div className="rounded-2xl bg-slate-950/60 p-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                              Market Learn
                            </p>
                            <p className="mt-1 text-xs font-black text-cyan-300">
                              {p.marketCalibration}
                            </p>
                          </div>
                        )}

                        {p.leagueCalibration && (
                          <div className="rounded-2xl bg-slate-950/60 p-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                              League Learn
                            </p>
                            <p className="mt-1 text-xs font-black text-emerald-300">
                              {p.leagueCalibration}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-950/60 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          Prediction Quality
                        </p>
                        <p className="mt-1 text-sm font-black text-cyan-300">
                          Tuned {p.tunedScore ?? p.premiumScore ?? p.valueScore}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-950/60 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          Squad Risk
                        </p>
                        <p className={`mt-1 text-sm font-black ${
                          (p.injuryPenalty || 0) > 0.08
                            ? "text-red-300"
                            : "text-emerald-300"
                        }`}>
                          {(p.injuryPenalty || 0) > 0.08 ? "Elevated" : "Normal"}
                        </p>
                      </div>
                    </div>

                    {p.oddsPrice && (
                      <div className="mt-4 rounded-2xl bg-cyan-400/10 p-3">
                        <p className="text-xs font-bold text-cyan-300">
                          Bookmaker Value
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          Quote {p.oddsPrice.toFixed(2)} bei {p.oddsBookmaker}. 
                          Modell: {pct(p.bestProbability)} · Markt: {p.impliedProb ? pct(p.impliedProb) : "n/a"} · Edge: {p.edge ? `${p.edge.toFixed(1)}%` : "n/a"}
                        </p>
                      </div>
                    )}
                    <div className="mt-4 flex gap-3">
                      <SavePickButton
                        matchId={p.id}
                        market={p.bestMarket}
                        pick={p.bestPick}
                        probability={Math.round(p.bestProbability)}
                      />

                      <a
                        href={`/matches/${p.id}`}
                        className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3 text-center text-sm font-bold text-slate-950"
                      >
                        Spielanalyse
                      </a>

                      <a
                        href={`/news`}
                        className="flex-1 rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-bold text-white"
                      >
                        News
                      </a>

                      <a
                        href={`/team-form?team=${encodeURIComponent(p.home)}`}
                        className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3 text-center text-sm font-bold text-slate-950"
                      >
                        Teamform
                      </a>
                    </div>
                  </div>
                  </article>
                </div>
              );
            })}
          </section>
        )}
        <GrowthCTA />

        <section className="glass-card rounded-[2rem] p-6 md:p-8">
          <h2 className="text-2xl font-black text-white">
            Warum diesen Picks vertrauen?
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-950/60 p-4">
              <p className="font-black text-cyan-300">Backtested</p>
              <p className="mt-2 text-sm text-slate-400">
                Historische Snapshots werden gegen echte Ergebnisse ausgewertet.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/60 p-4">
              <p className="font-black text-cyan-300">Kalibriert</p>
              <p className="mt-2 text-sm text-slate-400">
                Märkte und Ligen werden anhand gemessener Performance angepasst.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/60 p-4">
              <p className="font-black text-cyan-300">Transparent</p>
              <p className="mt-2 text-sm text-slate-400">
                Trefferquote, ROI-Simulation und Methodik sind sichtbar.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Top({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function Market({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "green" | "blue" | "pink" | "slate";
}) {
  const tones = {
    cyan: "from-cyan-400/20 to-cyan-400/5 border-cyan-400/20 text-cyan-300",
    green: "from-emerald-400/20 to-emerald-400/5 border-emerald-400/20 text-emerald-300",
    blue: "from-sky-400/20 to-sky-400/5 border-sky-400/20 text-sky-300",
    pink: "from-fuchsia-400/20 to-fuchsia-400/5 border-fuchsia-400/20 text-fuchsia-300",
    slate: "from-white/10 to-white/5 border-white/10 text-slate-300",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-3 text-center shadow-lg shadow-black/20 ${tones[tone]}`}>
      <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
