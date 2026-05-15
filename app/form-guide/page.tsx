import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FormGuidePage() {
  const matches = await prisma.match.findMany({
    take: 500,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const map = new Map<string, any>();

  function addTeam(name: string) {
    if (!map.has(name)) {
      map.set(name, {
        team: name,
        played: 0,
        points: 0,
        gf: 0,
        ga: 0,
        form: [],
      });
    }
  }

  for (const m of matches) {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;
    const hg = Number(m.homeGoals ?? 0);
    const ag = Number(m.awayGoals ?? 0);

    addTeam(home);
    addTeam(away);

    const h = map.get(home);
    const a = map.get(away);

    h.played++;
    a.played++;

    h.gf += hg;
    h.ga += ag;
    a.gf += ag;
    a.ga += hg;

    if (hg > ag) {
      h.points += 3;
      h.form.push("W");
      a.form.push("L");
    } else if (hg < ag) {
      a.points += 3;
      a.form.push("W");
      h.form.push("L");
    } else {
      h.points += 1;
      a.points += 1;
      h.form.push("D");
      a.form.push("D");
    }
  }

  const teams = [...map.values()]
    .map((t) => ({
      ...t,
      recent: t.form.slice(0, 5),
      ppg: t.played ? (t.points / t.played).toFixed(2) : "0.00",
      gd: t.gf - t.ga,
    }))
    .sort((a, b) => Number(b.ppg) - Number(a.ppg));

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Performance Intelligence</p>
          <h1 className="text-5xl font-bold">Form Guide</h1>
          <p className="mt-3 text-slate-400">
            Aktuelle Formkurven, Punkte pro Spiel und Torbilanz aller Teams.
          </p>
        </section>

        <section className="grid gap-5">
          {teams.map((t) => (
            <div
              key={t.team}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{t.team}</h2>
                  <p className="mt-2 text-slate-400">
                    PPG {t.ppg} · GD {t.gd} · Goals {t.gf}:{t.ga}
                  </p>
                </div>

                <div className="flex gap-2">
                  {t.recent.map((r: string, i: number) => (
                    <span
                      key={i}
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                        r === "W"
                          ? "bg-emerald-400 text-slate-950"
                          : r === "D"
                          ? "bg-yellow-400 text-slate-950"
                          : "bg-red-400 text-slate-950"
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
