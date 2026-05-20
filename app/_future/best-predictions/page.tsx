import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

type TeamStats = {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  points: number;
};

function getEmpty(team: string): TeamStats {
  return {
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
    points: 0,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

export default async function BestPredictionsPage() {
  const matches = await prisma.match.findMany({
    take: 500,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const stats = new Map<string, TeamStats>();

  function ensure(team: string) {
    if (!stats.has(team)) {
      stats.set(team, getEmpty(team));
    }
    return stats.get(team)!;
  }

  for (const m of matches) {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    const h = ensure(home);
    const a = ensure(away);

    const hg = Number(m.homeGoals ?? 0);
    const ag = Number(m.awayGoals ?? 0);

    h.played++;
    a.played++;

    h.gf += hg;
    h.ga += ag;

    a.gf += ag;
    a.ga += hg;

    if (hg > ag) {
      h.wins++;
      h.points += 3;
      a.losses++;
    } else if (hg < ag) {
      a.wins++;
      a.points += 3;
      h.losses++;
    } else {
      h.draws++;
      a.draws++;
      h.points += 1;
      a.points += 1;
    }
  }

  const elo = new Map<string, number>();

  function initElo(team: string) {
    if (!elo.has(team)) elo.set(team, 1500);
  }

  function expected(a: number, b: number) {
    return 1 / (1 + Math.pow(10, (b - a) / 400));
  }

  for (const m of [...matches].reverse()) {
    if (m.homeGoals === null || m.awayGoals === null) continue;

    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    initElo(home);
    initElo(away);

    const hRating = elo.get(home)! + 60;
    const aRating = elo.get(away)!;

    const hExpected = expected(hRating, aRating);
    const aExpected = expected(aRating, hRating);

    const hg = Number(m.homeGoals);
    const ag = Number(m.awayGoals);

    const hResult = hg > ag ? 1 : hg < ag ? 0 : 0.5;
    const aResult = ag > hg ? 1 : ag < hg ? 0 : 0.5;

    const k = 30;

    elo.set(home, elo.get(home)! + k * (hResult - hExpected));
    elo.set(away, elo.get(away)! + k * (aResult - aExpected));
  }

  const predictions = matches.slice(0, 60).map((m) => {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    const h = stats.get(home) || getEmpty(home);
    const a = stats.get(away) || getEmpty(away);

    const hPpg = h.played ? h.points / h.played : 1;
    const aPpg = a.played ? a.points / a.played : 1;

    const hAttack = h.played ? h.gf / h.played : 1;
    const aAttack = a.played ? a.gf / a.played : 1;

    const hDefense = h.played ? h.ga / h.played : 1;
    const aDefense = a.played ? a.ga / a.played : 1;

    const hElo = elo.get(home) ?? 1500;
    const aElo = elo.get(away) ?? 1500;

    const homeStrength =
      50 +
      hPpg * 10 +
      hAttack * 7 -
      hDefense * 4 +
      (hElo - 1500) / 18 +
      7;

    const awayStrength =
      50 +
      aPpg * 10 +
      aAttack * 7 -
      aDefense * 4 +
      (aElo - 1500) / 18;

    const diff = homeStrength - awayStrength;

    let homeWin = clamp(42 + diff * 1.2, 12, 78);
    let awayWin = clamp(32 - diff * 1.0, 10, 70);
    let draw = clamp(100 - homeWin - awayWin, 12, 34);

    const total = homeWin + draw + awayWin;
    homeWin = (homeWin / total) * 100;
    draw = (draw / total) * 100;
    awayWin = (awayWin / total) * 100;

    const best =
      homeWin >= draw && homeWin >= awayWin
        ? { label: "Home Win", team: home, prob: homeWin }
        : awayWin >= homeWin && awayWin >= draw
        ? { label: "Away Win", team: away, prob: awayWin }
        : { label: "Draw", team: "Draw", prob: draw };

    const confidence =
      best.prob >= 58 ? "High" : best.prob >= 48 ? "Medium" : "Low";

    const risk =
      best.prob >= 58 ? "Low Risk" : best.prob >= 48 ? "Medium Risk" : "High Risk";

    const reason =
      best.label === "Home Win"
        ? `${home} has stronger form, Elo rating and home advantage.`
        : best.label === "Away Win"
        ? `${away} rates higher on Elo, form and attacking output.`
        : "Both teams rate closely by Elo and form, so draw probability is relevant.";

    return {
      id: m.id,
      league: m.league?.name ?? "League",
      kickoff: m.kickoff,
      home,
      away,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      homeWin,
      draw,
      awayWin,
      best,
      confidence,
      risk,
      reason,
    };
  });

  const bestPicks = predictions
    .sort((a, b) => b.best.prob - a.best.prob)
    .slice(0, 24);

  return (
    <main className="min-h-screen stadium-page p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        <PageHero
          eyebrow="Prediction Intelligence"
          title="Best Predictions"
          description="Mobile-first predictions with probability, confidence, risk and simple explanations."
        />

        <section className="grid gap-4 md:grid-cols-3">
          <TopCard label="Best Pick" value={bestPicks[0]?.best.team ?? "N/A"} />
          <TopCard label="Highest Confidence" value={pct(bestPicks[0]?.best.prob ?? 0)} />
          <TopCard label="Model Type" value="Elo + Form" />
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {bestPicks.map((p) => (
            <article key={p.id} className="glass-card rounded-3xl p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    {p.league}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.kickoff
                      ? new Date(p.kickoff).toLocaleDateString("de-DE")
                      : "No date"}
                  </p>
                </div>

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

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex flex-1 flex-col items-center text-center">
                  <TeamBadge team={p.home} size={58} />
                  <p className="mt-3 text-sm font-bold md:text-base">{p.home}</p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500">Prediction</p>
                  <p className="mt-1 text-3xl font-black text-cyan-300">
                    {pct(p.best.prob)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{p.best.label}</p>
                </div>

                <div className="flex flex-1 flex-col items-center text-center">
                  <TeamBadge team={p.away} size={58} />
                  <p className="mt-3 text-sm font-bold md:text-base">{p.away}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <Prob label="Home" value={p.homeWin} />
                <Prob label="Draw" value={p.draw} />
                <Prob label="Away" value={p.awayWin} />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
                <p className="text-sm font-bold text-cyan-300">{p.risk}</p>
                <p className="mt-2 text-sm text-slate-300">{p.reason}</p>
              </div>

              <a
                href={`/prediction-detail?match=${p.id}`}
                className="mt-5 block rounded-2xl bg-cyan-400 px-5 py-4 text-center font-bold text-slate-950"
              >
                Why this pick?
              </a>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function TopCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-3xl p-5 md:p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-cyan-300 md:text-4xl">
        {value}
      </p>
    </div>
  );
}

function Prob({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-cyan-300">{pct(value)}</p>
    </div>
  );
}
