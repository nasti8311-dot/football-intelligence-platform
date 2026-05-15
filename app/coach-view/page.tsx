import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoachViewPage() {
  const matches = await prisma.match.findMany({
    take: 500,
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  const events = await prisma.event.findMany({
    take: 20000,
  });

  const teams = new Map<string, any>();

  function init(team: string) {
    if (!teams.has(team)) {
      teams.set(team, {
        team,
        matches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        gf: 0,
        ga: 0,
        shots: 0,
        passes: 0,
        tackles: 0,
        xg: 0,
      });
    }
  }

  for (const m of matches) {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    init(home);
    init(away);

    const h = teams.get(home);
    const a = teams.get(away);

    h.matches++;
    a.matches++;

    h.gf += Number(m.homeGoals ?? 0);
    h.ga += Number(m.awayGoals ?? 0);
    a.gf += Number(m.awayGoals ?? 0);
    a.ga += Number(m.homeGoals ?? 0);

    if (Number(m.homeGoals ?? 0) > Number(m.awayGoals ?? 0)) {
      h.wins++;
      a.losses++;
    } else if (Number(m.homeGoals ?? 0) < Number(m.awayGoals ?? 0)) {
      a.wins++;
      h.losses++;
    } else {
      h.draws++;
      a.draws++;
    }
  }

  for (const e of events) {
    const team = e.team || "Unknown";
    init(team);

    const t = teams.get(team);
    if (e.eventType === "shot") {
      t.shots++;
      t.xg += Number(e.xg ?? 0);
    }
    if (e.eventType === "pass") t.passes++;
    if (e.eventType === "tackle") t.tackles++;
  }

  const rows = [...teams.values()]
    .map((t) => {
      const attack = t.shots + t.gf * 5 + t.xg * 10;
      const control = t.passes;
      const defense = t.tackles + Math.max(0, 40 - t.ga);
      const risk = t.ga > t.gf ? "High" : t.ga > t.gf * 0.8 ? "Medium" : "Low";

      const advice =
        t.gf < t.ga
          ? "Defensive stability verbessern und weniger einfache Chancen zulassen."
          : t.shots < 30
          ? "Mehr Abschlüsse erzeugen und Angriffe konsequenter zu Ende spielen."
          : t.passes < 200
          ? "Ballbesitzphasen verlängern und Spielkontrolle erhöhen."
          : "Teamprofil ist stabil. Fokus auf Effizienz im letzten Drittel.";

      return {
        ...t,
        attack: Math.round(attack),
        control: Math.round(control),
        defense: Math.round(defense),
        risk,
        advice,
      };
    })
    .sort((a, b) => b.attack + b.control - (a.attack + a.control))
    .slice(0, 20);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Coach Intelligence</p>
          <h1 className="text-5xl font-black">Coach View</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Einfache Handlungsempfehlungen für Teams — verständlich statt technisch.
          </p>
        </section>

        <section className="grid gap-5">
          {rows.map((t) => (
            <div key={t.team} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-cyan-300">Team Report</p>
                  <h2 className="mt-1 text-3xl font-black">{t.team}</h2>
                  <p className="mt-3 max-w-3xl text-slate-300">{t.advice}</p>
                </div>

                <div className={`rounded-2xl px-5 py-3 text-center ${
                  t.risk === "High"
                    ? "bg-red-400/15 text-red-300"
                    : t.risk === "Medium"
                    ? "bg-yellow-400/15 text-yellow-300"
                    : "bg-emerald-400/15 text-emerald-300"
                }`}>
                  <p className="text-sm">Risk</p>
                  <p className="text-2xl font-black">{t.risk}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Metric label="Attack" value={Math.min(100, t.attack)} />
                <Metric label="Control" value={Math.min(100, Math.round(t.control / 10))} />
                <Metric label="Defense" value={Math.min(100, t.defense)} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-cyan-300">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-800">
        <div className="h-3 rounded-full bg-cyan-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
