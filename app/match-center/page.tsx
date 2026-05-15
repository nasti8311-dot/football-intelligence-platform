import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MatchCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ match?: string }>;
}) {
  const params = await searchParams;
  const selectedMatchId = params.match;

  const matches = await prisma.match.findMany({
    take: 50,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const selectedMatch =
    matches.find((m) => m.id === selectedMatchId) || matches[0];

  const events = selectedMatch
    ? await prisma.event.findMany({
        where: { matchId: selectedMatch.id },
        orderBy: { minute: "asc" },
        take: 1000,
      })
    : [];

  const homeName =
    selectedMatch?.homeTeam?.name || selectedMatch?.homeTeamId || "Home";
  const awayName =
    selectedMatch?.awayTeam?.name || selectedMatch?.awayTeamId || "Away";

  const homeEvents = events.filter((e) => e.team === homeName || e.team === selectedMatch?.homeTeamId);
  const awayEvents = events.filter((e) => e.team === awayName || e.team === selectedMatch?.awayTeamId);

  const shots = events.filter((e) => e.eventType === "shot");
  const passes = events.filter((e) => e.eventType === "pass");

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Match Deep Dive</p>
          <h1 className="page-title text-5xl font-black">Match Center</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Wähle ein Spiel und sieh Ergebnis, Events, Schüsse, Pässe und Momentum.
          </p>
        </section>

        <section className="max-h-72 space-y-2 overflow-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          {matches.map((m) => {
            const label = `${m.homeTeam?.name ?? m.homeTeamId} vs ${m.awayTeam?.name ?? m.awayTeamId}`;
            return (
              <a
                key={m.id}
                href={`/match-center?match=${m.id}`}
                className={`block rounded-2xl px-4 py-3 ${
                  selectedMatch?.id === m.id
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold">{label}</span>
                  <span>
                    {m.homeGoals ?? "-"}:{m.awayGoals ?? "-"}
                  </span>
                </div>
              </a>
            );
          })}
        </section>

        {selectedMatch && (
          <>
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <p className="text-sm text-cyan-300">
                {selectedMatch.league?.name ?? "League"}
              </p>

              <h2 className="mt-4 text-4xl font-black">
                {homeName} vs {awayName}
              </h2>

              <p className="mt-6 text-7xl font-black text-cyan-300">
                {selectedMatch.homeGoals ?? "-"}:{selectedMatch.awayGoals ?? "-"}
              </p>

              <p className="mt-4 text-slate-400">
                {selectedMatch.kickoff
                  ? new Date(selectedMatch.kickoff).toLocaleDateString("de-DE")
                  : "No date"}
              </p>
            </section>

            <section className="grid gap-5 md:grid-cols-4">
              <Card title="Events" value={events.length.toString()} />
              <Card title="Shots" value={shots.length.toString()} />
              <Card title="Passes" value={passes.length.toString()} />
              <Card title="Momentum" value={homeEvents.length >= awayEvents.length ? homeName : awayName} />
            </section>

            <section className="relative aspect-[105/68] overflow-hidden rounded-3xl border-4 border-white/20 bg-emerald-900">
              <div className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
              <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />

              <svg className="absolute inset-0 h-full w-full">
                {passes.map((e) => (
                  <line
                    key={e.id}
                    x1={`${Number(e.x ?? 50)}%`}
                    y1={`${Number(e.y ?? 50)}%`}
                    x2={`${Number(e.endX ?? e.x ?? 50)}%`}
                    y2={`${Number(e.endY ?? e.y ?? 50)}%`}
                    stroke="rgba(103,232,249,0.25)"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>

              {events.slice(0, 700).map((e) => (
                <div
                  key={e.id}
                  title={`${e.team} · ${e.player ?? "Unknown"} · ${e.eventType}`}
                  className={`absolute rounded-full ${
                    e.eventType === "shot"
                      ? "bg-red-400"
                      : e.eventType === "pass"
                      ? "bg-cyan-300"
                      : "bg-yellow-300"
                  }`}
                  style={{
                    width: e.eventType === "shot" ? 12 : 8,
                    height: e.eventType === "shot" ? 12 : 8,
                    left: `${Math.min(100, Math.max(0, Number(e.x ?? 50)))}%`,
                    top: `${Math.min(100, Math.max(0, Number(e.y ?? 50)))}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
