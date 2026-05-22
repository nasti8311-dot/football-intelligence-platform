import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: start,
        lte: end,
      },
    },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      bookmakerOdds: true,
      odds: true,
    },
    orderBy: {
      kickoff: "asc",
    },
  });

  const rows = matches.map((m) => ({
    id: m.id,
    match: `${m.homeTeam?.name} vs ${m.awayTeam?.name}`,
    league: m.league?.name || "Unknown",
    kickoff: m.kickoff,
    oddsRows: (m.bookmakerOdds?.length || 0) + (m.odds?.length || 0),
  }));

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Today
          </p>
          <h1 className="mt-3 text-5xl font-black">Heute</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Tagesübersicht aller Spiele und Odds-Verfügbarkeit.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card label="Spiele heute" value={rows.length} />
          <Card label="Mit Odds" value={rows.filter((r) => r.oddsRows > 0).length} />
          <Card label="Ohne Odds" value={rows.filter((r) => r.oddsRows <= 0).length} />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-neutral-500">
                  <th className="px-4 py-3">Spiel</th>
                  <th className="px-4 py-3">Liga</th>
                  <th className="px-4 py-3">Kickoff</th>
                  <th className="px-4 py-3">Odds</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="px-4 py-4 font-bold">{row.match}</td>
                    <td className="px-4 py-4 text-neutral-400">{row.league}</td>
                    <td className="px-4 py-4 text-neutral-400">
                      {row.kickoff ? new Date(row.kickoff).toLocaleString("de-DE") : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={
                        row.oddsRows > 0
                          ? "rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300"
                          : "rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-black text-yellow-300"
                      }>
                        {row.oddsRows}
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

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}
