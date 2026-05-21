import { prisma } from "@/lib/prisma";
import { buildTeamFormMap } from "@/lib/team-form-engine";
import { estimateExpectedGoals } from "@/lib/xg-engine";

export const dynamic = "force-dynamic";

export default async function XgLabPage() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: now,
        lte: in3Days,
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 80,
  });

  const formMap = await buildTeamFormMap();

  const rows = matches.map((match) => {
    const home = formMap[match.homeTeamId];
    const away = formMap[match.awayTeamId];

    const xg = estimateExpectedGoals({
      home,
      away,
    });

    return {
      id: match.id,
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      league: match.league?.name || "Unbekannt",
      homeSample: home?.played || 0,
      awaySample: away?.played || 0,
      homeXg: xg.homeXg,
      awayXg: xg.awayXg,
      totalXg: xg.totalXg,
      tempo: xg.tempo,
    };
  });

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Model Lab
          </p>
          <h1 className="mt-3 text-5xl font-black">xG Lab</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
            Interne Qualitätsansicht für erwartete Tore, Tempo und Datenbasis der nächsten Spiele.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-neutral-500">
                  <th className="px-4 py-3">Spiel</th>
                  <th className="px-4 py-3">Liga</th>
                  <th className="px-4 py-3">Sample</th>
                  <th className="px-4 py-3">Home xG</th>
                  <th className="px-4 py-3">Away xG</th>
                  <th className="px-4 py-3">Total xG</th>
                  <th className="px-4 py-3">Tempo</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="px-4 py-4 font-bold">{row.match}</td>
                    <td className="px-4 py-4 text-neutral-400">{row.league}</td>
                    <td className="px-4 py-4 text-neutral-400">
                      {row.homeSample}/{row.awaySample}
                    </td>
                    <td className="px-4 py-4">{row.homeXg.toFixed(2)}</td>
                    <td className="px-4 py-4">{row.awayXg.toFixed(2)}</td>
                    <td className="px-4 py-4 font-black text-emerald-300">
                      {row.totalXg.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                        {row.tempo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
