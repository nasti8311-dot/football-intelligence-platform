import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

export default async function PredictionDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ match?: string }>;
}) {
  const params = await searchParams;

  const match = await prisma.match.findFirst({
    where: params.match ? { id: params.match } : undefined,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  if (!match) {
    return (
      <main className="min-h-screen stadium-page p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <PageHero
            eyebrow="Prediction"
            title="No Match Found"
            description="No match was found for this prediction detail page."
          />
        </div>
      </main>
    );
  }

  const home = match.homeTeam?.name || match.homeTeamId;
  const away = match.awayTeam?.name || match.awayTeamId;

  const allMatches = await prisma.match.findMany({
    take: 800,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  function teamForm(team: string) {
    const games = allMatches
      .filter((m) => {
        const h = m.homeTeam?.name || m.homeTeamId;
        const a = m.awayTeam?.name || m.awayTeamId;
        return h === team || a === team;
      })
      .slice(0, 10);

    let points = 0;
    let gf = 0;
    let ga = 0;

    for (const g of games) {
      const h = g.homeTeam?.name || g.homeTeamId;
      const isHome = h === team;

      const forGoals = isHome ? Number(g.homeGoals ?? 0) : Number(g.awayGoals ?? 0);
      const againstGoals = isHome ? Number(g.awayGoals ?? 0) : Number(g.homeGoals ?? 0);

      gf += forGoals;
      ga += againstGoals;

      if (forGoals > againstGoals) points += 3;
      else if (forGoals === againstGoals) points += 1;
    }

    return {
      games: games.length,
      points,
      ppg: games.length ? points / games.length : 1,
      gf,
      ga,
    };
  }

  const h = teamForm(home);
  const a = teamForm(away);

  const homeStrength = 50 + h.ppg * 13 + h.gf * 1.2 - h.ga * 0.9 + 7;
  const awayStrength = 50 + a.ppg * 13 + a.gf * 1.2 - a.ga * 0.9;

  const diff = homeStrength - awayStrength;

  let homeWin = clamp(42 + diff * 1.1, 12, 78);
  let awayWin = clamp(32 - diff * 1.0, 10, 70);
  let draw = clamp(100 - homeWin - awayWin, 12, 34);

  const total = homeWin + draw + awayWin;
  homeWin = (homeWin / total) * 100;
  draw = (draw / total) * 100;
  awayWin = (awayWin / total) * 100;

  const pick =
    homeWin >= draw && homeWin >= awayWin
      ? { label: "Home Win", team: home, prob: homeWin }
      : awayWin >= homeWin && awayWin >= draw
      ? { label: "Away Win", team: away, prob: awayWin }
      : { label: "Draw", team: "Draw", prob: draw };

  return (
    <main className="min-h-screen stadium-page p-4 pb-24 text-white md:p-6">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        <PageHero
          eyebrow="Prediction Detail"
          title={`${home} vs ${away}`}
          description="Eine einfache Erklärung, warum das Modell diesen Pick bevorzugt."
        />

        <section className="glass-card rounded-3xl p-6 text-center">
          <p className="text-sm text-cyan-300">{match.league?.name ?? "League"}</p>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-col items-center">
              <TeamBadge team={home} size={72} />
              <p className="mt-3 font-bold">{home}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Best Pick</p>
              <p className="mt-2 text-5xl font-black text-cyan-300">{pct(pick.prob)}</p>
              <p className="mt-2 font-bold">{pick.label}</p>
            </div>

            <div className="flex flex-1 flex-col items-center">
              <TeamBadge team={away} size={72} />
              <p className="mt-3 font-bold">{away}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Prob label="Home Win" value={homeWin} />
          <Prob label="Draw" value={draw} />
          <Prob label="Away Win" value={awayWin} />
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h2 className="text-3xl font-black">Warum diese Prediction?</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Explain
              title={`${home} Form`}
              text={`Letzte ${h.games} Spiele: ${h.points} Punkte, Tore ${h.gf}:${h.ga}.`}
            />
            <Explain
              title={`${away} Form`}
              text={`Letzte ${a.games} Spiele: ${a.points} Punkte, Tore ${a.gf}:${a.ga}.`}
            />
            <Explain
              title="Home Advantage"
              text={`${home} bekommt einen Heimvorteil im Modell.`}
            />
            <Explain
              title="Risk"
              text={pick.prob >= 58 ? "Relativ niedrigeres Risiko." : pick.prob >= 48 ? "Mittleres Risiko." : "Höheres Risiko."}
            />
          </div>
        </section>

        <a
          href={`/match-center?match=${match.id}`}
          className="block rounded-2xl bg-cyan-400 px-6 py-4 text-center font-bold text-slate-950"
        >
          Open Match Center
        </a>
      </div>
    </main>
  );
}

function Prob({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-black text-cyan-300">{pct(value)}</p>
    </div>
  );
}

function Explain({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-5">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-slate-300">{text}</p>
    </div>
  );
}
