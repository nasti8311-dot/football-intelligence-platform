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

export default async function ValuePicksPage() {
  const matches = await prisma.match.findMany({
    take: 500,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const stats = new Map<string, any>();

  function init(team: string) {
    if (!stats.has(team)) {
      stats.set(team, {
        team,
        played: 0,
        points: 0,
        gf: 0,
        ga: 0,
      });
    }
    return stats.get(team);
  }

  for (const m of matches) {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    const h = init(home);
    const a = init(away);

    const hg = Number(m.homeGoals ?? 0);
    const ag = Number(m.awayGoals ?? 0);

    h.played++;
    a.played++;

    h.gf += hg;
    h.ga += ag;
    a.gf += ag;
    a.ga += hg;

    if (hg > ag) h.points += 3;
    else if (hg < ag) a.points += 3;
    else {
      h.points += 1;
      a.points += 1;
    }
  }

  const picks = matches.map((m) => {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    const h = stats.get(home) || init(home);
    const a = stats.get(away) || init(away);

    const hPpg = h.played ? h.points / h.played : 1;
    const aPpg = a.played ? a.points / a.played : 1;

    const hAttack = h.played ? h.gf / h.played : 1;
    const aAttack = a.played ? a.gf / a.played : 1;

    const hDefense = h.played ? h.ga / h.played : 1;
    const aDefense = a.played ? a.ga / a.played : 1;

    const homeStrength = 50 + hPpg * 12 + hAttack * 7 - hDefense * 4 + 7;
    const awayStrength = 50 + aPpg * 12 + aAttack * 7 - aDefense * 4;

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

    const edge = Math.round(best.prob - 40);

    return {
      id: m.id,
      league: m.league?.name ?? "League",
      kickoff: m.kickoff,
      home,
      away,
      best,
      edge,
      homeWin,
      draw,
      awayWin,
    };
  })
  .filter((p) => p.best.prob >= 52 && p.edge >= 8)
  .sort((a, b) => b.edge - a.edge)
  .slice(0, 30);

  return (
    <main className="min-h-screen stadium-page p-4 pb-24 text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        <PageHero
          eyebrow="Betting Intelligence"
          title="Value Picks"
          description="Picks mit stärkerem Modellvorteil, klarer Wahrscheinlichkeit und einfacher Risiko-Einschätzung."
        />

        <section className="grid gap-4 md:grid-cols-3">
          <Card label="Value Picks" value={String(picks.length)} />
          <Card label="Top Edge" value={picks[0] ? `+${picks[0].edge}` : "N/A"} />
          <Card label="Mode" value="Model Edge" />
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picks.map((p) => (
            <article key={p.id} className="glass-card rounded-3xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    {p.league}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.kickoff ? new Date(p.kickoff).toLocaleDateString("de-DE") : "No date"}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                  Edge +{p.edge}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="text-center">
                  <TeamBadge team={p.home} size={56} />
                  <p className="mt-2 text-sm font-bold">{p.home}</p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500">Pick</p>
                  <p className="mt-1 text-3xl font-black text-cyan-300">{pct(p.best.prob)}</p>
                  <p className="mt-1 text-xs text-slate-400">{p.best.label}</p>
                </div>

                <div className="text-center">
                  <TeamBadge team={p.away} size={56} />
                  <p className="mt-2 text-sm font-bold">{p.away}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
                <p className="text-sm font-bold text-cyan-300">
                  Why value?
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Das Modell sieht {p.best.team} deutlich stärker als die Basislinie.
                </p>
              </div>

              <a
                href={`/prediction-detail?match=${p.id}`}
                className="mt-5 block rounded-2xl bg-cyan-400 px-5 py-4 text-center font-bold text-slate-950"
              >
                Explain Pick
              </a>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
