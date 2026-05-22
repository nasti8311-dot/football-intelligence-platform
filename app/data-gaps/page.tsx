import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DataGapsPage() {
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
      league: true,
      homeTeam: true,
      awayTeam: true,
      bookmakerOdds: true,
      odds: true,
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 300,
  });

  const rows = matches.map((m) => {
    const oddsRows =
      (m.bookmakerOdds?.length || 0) +
      (m.odds?.length || 0);

    return {
      id: m.id,
      match: `${m.homeTeam?.name} vs ${m.awayTeam?.name}`,
      league: m.league?.name || "Unknown",
      kickoff: m.kickoff,
      oddsRows,
      issue:
        oddsRows <= 0
          ? "NO_ODDS"
          : oddsRows < 3
            ? "LOW_ODDS_DEPTH"
            : "OK",
    };
  });

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Data Quality
          </p>
          <h1 className="mt-3 text-5xl font-black">Data Gaps</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Zeigt, warum Spiele nicht als Verified Pick erscheinen.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card label="Total" value={rows.length} />
          <Card label="No Odds" value={rows.filter((r) => r.issue === "NO_ODDS").length} />
          <Card label="OK" value={rows.filter((r) => r.issue === "OK").length} />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-neutral-500">
                  <th className="px-4 py-3">Match</th>
                  <th className="px-4 py-3">League</th>
                  <th className="px-4 py-3">Odds Rows</th>
                  <th className="px-4 py-3">Issue</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="px-4 py-4 font-bold">{row.match}</td>
                    <td className="px-4 py-4 text-neutral-400">{row.league}</td>
                    <td className="px-4 py-4">{row.oddsRows}</td>
                    <td className="px-4 py-4">
                      <span className={
                        row.issue === "OK"
                          ? "rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300"
                          : "rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-black text-yellow-300"
                      }>
                        {row.issue}
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
