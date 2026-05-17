import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function pct(v: number) {
  return `${Math.round(v)}%`;
}

function teamKey(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/fc|cf|afc|sc|sv|club|football|munchen|muenchen/g, "")
    .replace(/manchester city/g, "city")
    .replace(/fc bayern/g, "bayern")
    .replace(/bayern munich/g, "bayern")
    .replace(/borussia dortmund/g, "dortmund")
    .replace(/bayer leverkusen/g, "leverkusen")
    .replace(/rb leipzig/g, "leipzig")
    .replace(/real madrid/g, "real-madrid")
    .replace(/barcelona/g, "barcelona")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fallbackStrength(name: string) {
  const key = teamKey(name);

  const elite = ["bayern", "dortmund", "leverkusen", "real-madrid", "barcelona", "arsenal", "liverpool", "city", "psg", "inter", "juventus"];
  const strong = ["leipzig", "chelsea", "tottenham", "napoli", "roma", "atletico", "milan", "newcastle"];

  if (elite.some((x) => key.includes(x))) return { ppg: 2.05, attack: 2.0, defense: 0.9 };
  if (strong.some((x) => key.includes(x))) return { ppg: 1.65, attack: 1.55, defense: 1.15 };

  return { ppg: 1.25, attack: 1.2, defense: 1.35 };
}

function poisson(lambda: number, k: number) {
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / fact;
}

function markets(homeXg: number, awayXg: number) {
  let home = 0;
  let draw = 0;
  let away = 0;
  let over25 = 0;
  let btts = 0;

  for (let h = 0; h <= 8; h++) {
    for (let a = 0; a <= 8; a++) {
      const p = poisson(homeXg, h) * poisson(awayXg, a);

      if (h > a) home += p;
      else if (h === a) draw += p;
      else away += p;

      if (h + a >= 3) over25 += p;
      if (h > 0 && a > 0) btts += p;
    }
  }

  return {
    homeWin: home * 100,
    draw: draw * 100,
    awayWin: away * 100,
    over25: over25 * 100,
    under25: 100 - over25 * 100,
    bttsYes: btts * 100,
    bttsNo: 100 - btts * 100,
  };
}

export default async function HomePage() {
  const now = new Date();

  const matches = await prisma.match.findMany({
    take: 1500,
    orderBy: { kickoff: "asc" },
    include: { homeTeam: true, awayTeam: true, league: true },
  });

  const past = matches.filter(
    (m) => m.kickoff && new Date(m.kickoff) < now && m.homeGoals !== null && m.awayGoals !== null
  );

  const upcoming = matches.filter(
    (m) => m.kickoff && new Date(m.kickoff) > now && (m.homeGoals === null || m.awayGoals === null)
  );

  const stats = new Map<string, any>();

  function init(team: string) {
    const key = teamKey(team);
    if (!stats.has(key)) {
      stats.set(key, { played: 0, points: 0, gf: 0, ga: 0 });
    }
    return stats.get(key);
  }

  for (const m of past) {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;
    const h = init(home);
    const a = init(away);

    const hg = Number(m.homeGoals ?? 0);
    const ag = Number(m.awayGoals ?? 0);

    h.played++;
    a.played++;
    h.gf += hg;
    h.ga += ag;
    a.gf += ag;
    a.ga += hg;

    if (hg > ag) h.points += 3;
    else if (hg < ag) a.points += 3;
    else {
      h.points++;
      a.points++;
    }
  }

  function lastTen(team: string) {
    return past
      .filter((m) => {
        const home = m.homeTeam?.name || m.homeTeamId;
        const away = m.awayTeam?.name || m.awayTeamId;
        return teamKey(home) === teamKey(team) || teamKey(away) === teamKey(team);
      })
      .slice(-10)
      .reverse()
      .map((m) => {
        const home = m.homeTeam?.name || m.homeTeamId;
        const away = m.awayTeam?.name || m.awayTeamId;
        const isHome = teamKey(home) === teamKey(team);

        const gf = isHome ? Number(m.homeGoals ?? 0) : Number(m.awayGoals ?? 0);
        const ga = isHome ? Number(m.awayGoals ?? 0) : Number(m.homeGoals ?? 0);

        return {
          opponent: isHome ? away : home,
          result: gf > ga ? "W" : gf < ga ? "L" : "D",
          score: `${gf}:${ga}`,
        };
      });
  }

  const predictions = upcoming.map((m) => {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    const h = stats.get(teamKey(home)) || fallbackStrength(home);
    const a = stats.get(teamKey(away)) || fallbackStrength(away);

    const hf = fallbackStrength(home);
    const af = fallbackStrength(away);

    const hPpg = h.played ? h.points / h.played : hf.ppg;
    const aPpg = a.played ? a.points / a.played : af.ppg;

    const hAttack = h.played ? h.gf / h.played : hf.attack;
    const aAttack = a.played ? a.gf / a.played : af.attack;

    const hDefense = h.played ? h.ga / h.played : hf.defense;
    const aDefense = a.played ? a.ga / a.played : af.defense;

    const homeXg = clamp(1.25 + hAttack * 0.42 - aDefense * 0.22 + hPpg * 0.18 + 0.18, 0.35, 3.2);
    const awayXg = clamp(1.05 + aAttack * 0.42 - hDefense * 0.22 + aPpg * 0.18, 0.25, 3.0);

    const mk = markets(homeXg, awayXg);

    const options = [
      { market: "Sieg Heim", pick: home, prob: mk.homeWin },
      { market: "Unentschieden", pick: "X", prob: mk.draw },
      { market: "Sieg Auswärts", pick: away, prob: mk.awayWin },
      { market: "Über 2.5 Tore", pick: "Over 2.5", prob: mk.over25 },
      { market: "Unter 2.5 Tore", pick: "Under 2.5", prob: mk.under25 },
      { market: "Beide treffen", pick: "BTTS Yes", prob: mk.bttsYes },
    ].sort((x, y) => y.prob - x.prob);

    const best = options[0];

    return {
      id: m.id,
      league: m.league?.name ?? "League",
      kickoff: m.kickoff,
      home,
      away,
      homeXg,
      awayXg,
      best,
      markets: mk,
      confidence: best.prob >= 62 ? "High" : best.prob >= 54 ? "Medium" : "Low",
      homeLast10: lastTen(home),
      awayLast10: lastTen(away),
    };
  }).sort((a, b) => b.best.prob - a.best.prob);

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Daily Football Predictions</p>
          <h1 className="page-title mt-4 text-4xl font-black leading-tight md:text-6xl">
            Beste Predictions für kommende Spiele
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Wahrscheinlichkeiten für Sieg, Tore Über/Unter 2.5 und Beide Treffen — berechnet aus Form, Torprofilen, Heimvorteil und Poisson-Modell.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Top label="Spiele" value={String(predictions.length)} />
            <Top label="Top Pick" value={predictions[0] ? pct(predictions[0].best.prob) : "0%"} />
            <Top label="Modell" value="Poisson" />
          </div>
        </section>

        {predictions.length === 0 ? (
          <section className="glass-card rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-black">Keine kommenden Spiele gefunden</h2>
            <p className="mt-3 text-slate-300">
              Importiere zukünftige Fixtures, dann erscheinen hier täglich echte Predictions.
            </p>
            <Link href="/upload-center" className="mt-6 inline-block rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950">
              Fixtures importieren
            </Link>
          </section>
        ) : (
          <section className="grid gap-5">
            {predictions.slice(0, 20).map((p) => (
              <article key={p.id} className="glass-card rounded-[2rem] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{p.league}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {p.kickoff ? new Date(p.kickoff).toLocaleDateString("de-DE") : "No date"}
                    </p>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    p.confidence === "High" ? "bg-emerald-400/15 text-emerald-300" :
                    p.confidence === "Medium" ? "bg-yellow-400/15 text-yellow-300" :
                    "bg-red-400/15 text-red-300"
                  }`}>
                    {p.confidence}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex flex-1 flex-col items-center text-center">
                    <TeamBadge team={p.home} size={64} />
                    <p className="mt-3 text-sm font-black">{p.home}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-slate-500">Top Pick</p>
                    <p className="mt-1 text-4xl font-black text-cyan-300">{pct(p.best.prob)}</p>
                    <p className="mt-1 text-xs font-bold text-slate-300">{p.best.market}</p>
                  </div>

                  <div className="flex flex-1 flex-col items-center text-center">
                    <TeamBadge team={p.away} size={64} />
                    <p className="mt-3 text-sm font-black">{p.away}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  <Mini label="Heim" value={pct(p.markets.homeWin)} />
                  <Mini label="X" value={pct(p.markets.draw)} />
                  <Mini label="Auswärts" value={pct(p.markets.awayWin)} />
                  <Mini label="Over 2.5" value={pct(p.markets.over25)} />
                  <Mini label="Under 2.5" value={pct(p.markets.under25)} />
                  <Mini label="BTTS" value={pct(p.markets.bttsYes)} />
                </div>

                <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
                  <p className="text-sm font-bold text-cyan-300">Warum?</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Erwartete Tore: {p.home} {p.homeXg.toFixed(2)} · {p.away} {p.awayXg.toFixed(2)}.
                    Das Modell bewertet daraus 1X2, Tore und BTTS.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <LastTen title={p.home} games={p.homeLast10} />
                  <LastTen title={p.away} games={p.awayLast10} />
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function Top({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function LastTen({
  title,
  games,
}: {
  title: string;
  games: { opponent: string; result: string; score: string }[];
}) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className="text-xs font-bold text-slate-400">
        Letzte 10: {title}
      </p>

      {games.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500">
          Keine Historie gefunden
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {games.map((g, i) => (
            <div
              key={`${g.opponent}-${i}`}
              title={`${g.opponent} ${g.score}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                g.result === "W"
                  ? "bg-emerald-400 text-slate-950"
                  : g.result === "D"
                  ? "bg-yellow-400 text-slate-950"
                  : "bg-red-400 text-slate-950"
              }`}
            >
              {g.result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-3 text-center">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-cyan-300">{value}</p>
    </div>
  );
}
