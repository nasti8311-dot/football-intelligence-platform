import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";

export default async function LiveMatches() {
  const matches = await prisma.match.findMany({
    take: 6,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-cyan-300">
            Match Intelligence
          </p>

          <h2 className="mt-1 text-3xl font-black">
            Latest Matches
          </h2>
        </div>

        <Link
          href="/match-center"
          className="rounded-2xl bg-cyan-400 px-4 py-2 font-bold text-slate-950"
        >
          Open Match Center
        </Link>
      </div>

      <div className="grid gap-4">
        {matches.map((m) => {
          const home =
            m.homeTeam?.name || m.homeTeamId || "Home";

          const away =
            m.awayTeam?.name || m.awayTeamId || "Away";

          return (
            <Link
              key={m.id}
              href={`/match-center?match=${m.id}`}
              className="rounded-3xl bg-slate-950/60 p-5 transition hover:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <TeamBadge team={home} size={54} />

                  <div>
                    <p className="font-bold">
                      {home}
                    </p>

                    <p className="text-sm text-slate-500">
                      Home
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-4xl font-black text-cyan-300">
                    {m.homeGoals ?? "-"}:{m.awayGoals ?? "-"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {m.league?.name ?? "League"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">
                      {away}
                    </p>

                    <p className="text-sm text-slate-500">
                      Away
                    </p>
                  </div>

                  <TeamBadge team={away} size={54} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
