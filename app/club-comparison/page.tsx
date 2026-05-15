import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClubComparisonPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const params = await searchParams;

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
  });

  const teamA = params.a || teams[0]?.name || "";
  const teamB = params.b || teams[1]?.name || "";

  async function getProfile(team: string) {
    const events = await prisma.event.findMany({
      where: { team },
      take: 10000,
    });

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeam: { name: team } },
          { awayTeam: { name: team } },
          { homeTeamId: team },
          { awayTeamId: team },
        ],
      },
      take: 100,
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let gf = 0;
    let ga = 0;

    for (const m of matches) {
      const home = m.homeTeam?.name || m.homeTeamId;
      const isHome = home === team;

      const forGoals = isHome ? Number(m.homeGoals ?? 0) : Number(m.awayGoals ?? 0);
      const againstGoals = isHome ? Number(m.awayGoals ?? 0) : Number(m.homeGoals ?? 0);

      gf += forGoals;
      ga += againstGoals;

      if (forGoals > againstGoals) wins++;
      else if (forGoals < againstGoals) losses++;
      else draws++;
    }

    const shots = events.filter((e) => e.eventType === "shot").length;
    const passes = events.filter((e) => e.eventType === "pass").length;
    const tackles = events.filter((e) => e.eventType === "tackle").length;
    const xg = events.reduce((s, e) => s + Number(e.xg ?? 0), 0);

    return {
      team,
      matches: matches.length,
      wins,
      draws,
      losses,
      gf,
      ga,
      gd: gf - ga,
      events: events.length,
      shots,
      passes,
      tackles,
      xg,
      attack: Math.min(100, Math.round(shots * 4 + xg * 10)),
      possession: Math.min(100, Math.round(passes * 0.5)),
      defending: Math.min(100, Math.round(tackles * 5)),
    };
  }

  const [a, b] = await Promise.all([getProfile(teamA), getProfile(teamB)]);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Competitive Intelligence</p>
          <h1 className="page-title text-5xl font-black">Club Comparison</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Vergleiche zwei Teams direkt nach Form, Angriff, Ballbesitz und Defensive.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <TeamSelector label="Team A" name="a" value={teamA} otherName="b" otherValue={teamB} teams={teams} />
          <TeamSelector label="Team B" name="b" value={teamB} otherName="a" otherValue={teamA} teams={teams} />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <ClubCard profile={a} />
          <ClubCard profile={b} />
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h2 className="text-3xl font-bold">Head-to-Head Profile</h2>

          <div className="mt-6 space-y-5">
            <CompareBar label="Attack" a={a.attack} b={b.attack} teamA={a.team} teamB={b.team} />
            <CompareBar label="Possession" a={a.possession} b={b.possession} teamA={a.team} teamB={b.team} />
            <CompareBar label="Defending" a={a.defending} b={b.defending} teamA={a.team} teamB={b.team} />
            <CompareBar label="Goal Difference" a={Math.max(0, a.gd + 50)} b={Math.max(0, b.gd + 50)} teamA={a.team} teamB={b.team} />
          </div>
        </section>
      </div>
    </main>
  );
}

function TeamSelector({
  label,
  name,
  value,
  otherName,
  otherValue,
  teams,
}: {
  label: string;
  name: string;
  value: string;
  otherName: string;
  otherValue: string;
  teams: { name: string }[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="mb-3 text-sm text-cyan-300">{label}</p>
      <div className="flex max-h-40 flex-wrap gap-2 overflow-auto">
        {teams.slice(0, 50).map((t) => (
          <a
            key={t.name}
            href={`/club-comparison?${name}=${encodeURIComponent(t.name)}&${otherName}=${encodeURIComponent(otherValue)}`}
            className={`rounded-xl px-3 py-2 text-sm ${
              value === t.name ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-slate-300"
            }`}
          >
            {t.name}
          </a>
        ))}
      </div>
    </div>
  );
}

function ClubCard({ profile }: { profile: any }) {
  return (
    <div className="glass-card rounded-3xl p-7">
      <h2 className="text-4xl font-black">{profile.team}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Stat label="Matches" value={profile.matches} />
        <Stat label="Wins" value={profile.wins} />
        <Stat label="Goals" value={`${profile.gf}:${profile.ga}`} />
        <Stat label="xG" value={profile.xg.toFixed(2)} />
        <Stat label="Shots" value={profile.shots} />
        <Stat label="Passes" value={profile.passes} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function CompareBar({
  label,
  a,
  b,
  teamA,
  teamB,
}: {
  label: string;
  a: number;
  b: number;
  teamA: string;
  teamB: string;
}) {
  const total = Math.max(1, a + b);
  const aPct = Math.round((a / total) * 100);
  const bPct = 100 - aPct;

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{teamA}</span>
        <span className="text-slate-400">{label}</span>
        <span>{teamB}</span>
      </div>
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-800">
        <div className="bg-cyan-400" style={{ width: `${aPct}%` }} />
        <div className="bg-emerald-400" style={{ width: `${bPct}%` }} />
      </div>
    </div>
  );
}
