import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";

export default async function TeamSpotlight() {
  const teams = await prisma.team.findMany({
    take: 8,
    orderBy: { name: "asc" },
  });

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <p className="text-sm text-cyan-300">Club Spotlight</p>
        <h2 className="mt-1 text-3xl font-black">Featured Clubs</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/team-profile?team=${encodeURIComponent(team.name)}`}
            className="rounded-3xl bg-slate-950/60 p-5 text-center transition hover:scale-[1.03]"
          >
            <div className="flex justify-center">
              <TeamBadge team={team.name} size={72} />
            </div>

            <h3 className="mt-4 font-black">{team.name}</h3>
            <p className="mt-2 text-sm text-cyan-300">Open Profile →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
