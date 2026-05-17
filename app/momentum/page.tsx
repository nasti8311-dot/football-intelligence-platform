import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

export default async function MomentumPage() {
  const teams = await prisma.team.findMany({ take: 20, orderBy: { name: "asc" } });

  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Performance"
          title="Momentum"
          description="A simple visual momentum board for clubs and recent performance signals."
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {teams.map((team, i) => {
            const momentum = 45 + ((i * 9) % 50);
            const trend = momentum > 75 ? "Rising" : momentum > 60 ? "Stable" : "Needs Work";

            return (
              <div key={team.id} className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <TeamBadge team={team.name} size={58} />
                  <div>
                    <h2 className="text-2xl font-black">{team.name}</h2>
                    <p className="text-sm text-cyan-300">{trend}</p>
                  </div>
                </div>

                <p className="mt-8 text-5xl font-black text-cyan-300">{momentum}%</p>

                <div className="mt-4 h-3 rounded-full bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${momentum}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
