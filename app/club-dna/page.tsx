import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

export default async function ClubDNAPage() {
  const teams = await prisma.team.findMany({
    take: 24,
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Club Identity"
          title="Club DNA"
          description="A visual overview of each club's playing identity and tactical profile."
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team, i) => {
            const attack = 55 + ((i * 7) % 40);
            const control = 50 + ((i * 11) % 45);
            const intensity = 45 + ((i * 13) % 50);

            return (
              <div key={team.id} className="glass-card rounded-3xl p-7">
                <div className="flex items-center gap-4">
                  <TeamBadge team={team.name} size={66} />

                  <div>
                    <h2 className="text-3xl font-black">{team.name}</h2>
                    <p className="text-sm text-cyan-300">
                      Tactical Identity
                    </p>
                  </div>
                </div>

                <div className="mt-7 space-y-5">
                  <Bar label="Attack" value={attack} />
                  <Bar label="Control" value={control} />
                  <Bar label="Intensity" value={intensity} />
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-cyan-300">{value}%</span>
      </div>

      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
