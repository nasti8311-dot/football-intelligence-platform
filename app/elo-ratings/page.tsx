import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

function expected(a: number, b: number) {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

function result(homeGoals: number, awayGoals: number) {
  if (homeGoals > awayGoals) return [1, 0];
  if (homeGoals < awayGoals) return [0, 1];
  return [0.5, 0.5];
}

export default async function EloRatingsPage() {
  const matches = await prisma.match.findMany({
    take: 1000,
    orderBy: { kickoff: "asc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const ratings = new Map<string, number>();
  const records = new Map<string, any>();

  function init(team: string) {
    if (!ratings.has(team)) ratings.set(team, 1500);
    if (!records.has(team)) {
      records.set(team, {
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      });
    }
  }

  for (const m of matches) {
    if (m.homeGoals === null || m.awayGoals === null) continue;

    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    init(home);
    init(away);

    const homeRating = ratings.get(home)! + 60;
    const awayRating = ratings.get(away)!;

    const [homeResult, awayResult] = result(
      Number(m.homeGoals),
      Number(m.awayGoals)
    );

    const homeExpected = expected(homeRating, awayRating);
    const awayExpected = expected(awayRating, homeRating);

    const goalDiff = Math.abs(Number(m.homeGoals) - Number(m.awayGoals));
    const k = 28 + Math.min(goalDiff, 4) * 4;

    ratings.set(
      home,
      ratings.get(home)! + k * (homeResult - homeExpected)
    );

    ratings.set(
      away,
      ratings.get(away)! + k * (awayResult - awayExpected)
    );

    const h = records.get(home);
    const a = records.get(away);

    h.played++;
    a.played++;

    h.goalsFor += Number(m.homeGoals);
    h.goalsAgainst += Number(m.awayGoals);

    a.goalsFor += Number(m.awayGoals);
    a.goalsAgainst += Number(m.homeGoals);

    if (homeResult === 1) {
      h.wins++;
      a.losses++;
    } else if (awayResult === 1) {
      a.wins++;
      h.losses++;
    } else {
      h.draws++;
      a.draws++;
    }
  }

  const rows = [...records.values()]
    .map((r) => ({
      ...r,
      rating: Math.round(ratings.get(r.team) ?? 1500),
      goalDiff: r.goalsFor - r.goalsAgainst,
    }))
    .sort((a, b) => b.rating - a.rating);

  return (
    <main className="min-h-screen stadium-page p-4 pb-24 text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        <PageHero
          eyebrow="Prediction Engine"
          title="Elo Ratings"
          description="Ein echtes Rating-System als Grundlage für bessere Football Predictions."
        />

        <section className="grid gap-4 md:grid-cols-3">
          <Card label="Top Team" value={rows[0]?.team ?? "N/A"} />
          <Card label="Top Elo" value={String(rows[0]?.rating ?? 0)} />
          <Card label="Teams Rated" value={String(rows.length)} />
        </section>

        <section className="grid gap-4">
          {rows.map((team, index) => (
            <article key={team.team} className="glass-card rounded-3xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <TeamBadge team={team.team} size={58} />

                  <div>
                    <p className="text-sm text-cyan-300">Rank #{index + 1}</p>
                    <h2 className="text-2xl font-black">{team.team}</h2>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">Elo</p>
                  <p className="text-4xl font-black text-cyan-300">
                    {team.rating}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                <Mini label="P" value={team.played} />
                <Mini label="W" value={team.wins} />
                <Mini label="D" value={team.draws} />
                <Mini label="L" value={team.losses} />
              </div>

              <div className="mt-4 rounded-2xl bg-slate-950/60 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Goal Difference</span>
                  <span className="font-bold text-cyan-300">
                    {team.goalDiff}
                  </span>
                </div>
              </div>
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

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
