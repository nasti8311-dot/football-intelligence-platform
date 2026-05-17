import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

export default async function MatchRoomPage() {
  const matches = await prisma.match.findMany({
    take: 12,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Matchday"
          title="Match Room"
          description="A premium matchday cockpit for reviewing recent games and tactical context."
        />

        <section className="grid gap-6 md:grid-cols-2">
          {matches.map((m) => {
            const home = m.homeTeam?.name || m.homeTeamId || "Home";
            const away = m.awayTeam?.name || m.awayTeamId || "Away";

            return (
              <a
                key={m.id}
                href={`/match-center?match=${m.id}`}
                className="glass-card rounded-3xl p-7 transition hover:scale-[1.02]"
              >
                <p className="text-sm text-cyan-300">{m.league?.name ?? "League"}</p>

                <div className="mt-6 flex items-center justify-between gap-5">
                  <div className="text-center">
                    <TeamBadge team={home} size={70} />
                    <p className="mt-3 font-bold">{home}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-6xl font-black text-cyan-300">
                      {m.homeGoals ?? "-"}:{m.awayGoals ?? "-"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Open Match →
                    </p>
                  </div>

                  <div className="text-center">
                    <TeamBadge team={away} size={70} />
                    <p className="mt-3 font-bold">{away}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </section>
      </div>
    </main>
  );
}
