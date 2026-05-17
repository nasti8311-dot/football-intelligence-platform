import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";


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
    .replace(/internazionale/g, "inter")
    .replace(/paris saint germain/g, "psg")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}


function fallbackStrength(name: string) {
  const key = teamKey(name);

  const elite = [
    "bayern",
    "dortmund",
    "leverkusen",
    "real-madrid",
    "barcelona",
    "arsenal",
    "liverpool",
    "city",
    "chelsea",
    "psg",
    "inter",
    "milan",
    "juventus",
  ];

  const strong = [
    "leipzig",
    "tottenham",
    "napoli",
    "roma",
    "atletico",
    "monaco",
    "marseille",
    "newcastle",
    "aston-villa",
  ];

  if (elite.some((x) => key.includes(x))) {
    return { ppg: 2.05, attack: 2.0, defense: 0.9 };
  }

  if (strong.some((x) => key.includes(x))) {
    return { ppg: 1.65, attack: 1.55, defense: 1.15 };
  }

  return { ppg: 1.25, attack: 1.2, defense: 1.35 };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

export default async function UpcomingPredictionsPage() {
  const now = new Date();

  const allMatches = await prisma.match.findMany({
    take: 1500,
    orderBy: { kickoff: "asc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const pastMatches = allMatches.filter(
    (m) =>
      m.kickoff &&
      new Date(m.kickoff) < now &&
      m.homeGoals !== null &&
      m.awayGoals !== null
  );

  const upcoming = allMatches.filter(
    (m) =>
      m.kickoff &&
      new Date(m.kickoff) > now &&
      (m.homeGoals === null || m.awayGoals === null)
  );

  const stats = new Map<string, any>();

  function init(team: string) {
    if (!stats.has(team)) {
      stats.set(team, {
        team,
        played: 0,
        points: 0,
        gf: 0,
        ga: 0,
      });
    }
    return stats.get(team);
  }

  for (const m of pastMatches) {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;
    const homeKey = teamKey(home);
    const awayKey = teamKey(away);

    const h = init(homeKey);
    const a = init(awayKey);

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
      h.points += 1;
      a.points += 1;
    }
  }

  const predictions = upcoming.map((m) => {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;
    const homeKey = teamKey(home);
    const awayKey = teamKey(away);

    const h = stats.get(teamKey(home)) || init(teamKey(home));
    const a = stats.get(teamKey(away)) || init(teamKey(away));

    const hFallback = fallbackStrength(home);
    const aFallback = fallbackStrength(away);

    const hPpg = h.played ? h.points / h.played : hFallback.ppg;
    const aPpg = a.played ? a.points / a.played : aFallback.ppg;

    const hAttack = h.played ? h.gf / h.played : hFallback.attack;
    const aAttack = a.played ? a.gf / a.played : aFallback.attack;

    const hDefense = h.played ? h.ga / h.played : hFallback.defense;
    const aDefense = a.played ? a.ga / a.played : aFallback.defense;

    const homeStrength = 50 + hPpg * 12 + hAttack * 7 - hDefense * 4 + 7;
    const awayStrength = 50 + aPpg * 12 + aAttack * 7 - aDefense * 4;

    const diff = homeStrength - awayStrength;

    let homeWin = clamp(42 + diff * 1.2, 12, 78);
    let awayWin = clamp(32 - diff * 1.0, 10, 70);
    let draw = clamp(100 - homeWin - awayWin, 12, 34);

    const total = homeWin + draw + awayWin;

    homeWin = (homeWin / total) * 100;
    draw = (draw / total) * 100;
    awayWin = (awayWin / total) * 100;

    const best =
      homeWin >= draw && homeWin >= awayWin
        ? { label: "Home Win", team: home, prob: homeWin }
        : awayWin >= homeWin && awayWin >= draw
        ? { label: "Away Win", team: away, prob: awayWin }
        : { label: "Draw", team: "Draw", prob: draw };

    return {
      id: m.id,
      league: m.league?.name ?? "League",
      kickoff: m.kickoff,
      home,
      away,
      homeWin,
      draw,
      awayWin,
      best,
      confidence:
        best.prob >= 58 ? "High" : best.prob >= 48 ? "Medium" : "Low",
    };
  });

  predictions.sort((a, b) => b.best.prob - a.best.prob);

  return (
    <main className="min-h-screen stadium-page p-4 pb-24 text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        <PageHero
          eyebrow="Future Predictions"
          title="Upcoming Predictions"
          description="Nur zukünftige Spiele mit echten Vorhersagen vor dem Anpfiff."
        />

        {predictions.length === 0 ? (
          <section className="glass-card rounded-3xl p-8 text-center">
            <h2 className="text-4xl font-black">Keine zukünftigen Fixtures gefunden</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Deine Datenbank enthält aktuell wahrscheinlich nur bereits gespielte Matches.
              Importiere Fixtures mit zukünftigem Datum und leeren Torfeldern, dann erscheinen hier echte Predictions vor dem Spiel.
            </p>
            <a
              href="/upload-center"
              className="mt-8 inline-block rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950"
            >
              Import Fixtures
            </a>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card label="Upcoming Matches" value={String(predictions.length)} />
              <Card label="Best Pick" value={predictions[0]?.best.team ?? "N/A"} />
              <Card label="Confidence" value={pct(predictions[0]?.best.prob ?? 0)} />
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {predictions.slice(0, 30).map((p) => (
                <article key={p.id} className="glass-card rounded-3xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                        {p.league}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {p.kickoff
                          ? new Date(p.kickoff).toLocaleDateString("de-DE")
                          : "No date"}
                      </p>
                    </div>

                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                      {p.confidence}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div className="text-center">
                      <TeamBadge team={p.home} size={56} />
                      <p className="mt-2 text-sm font-bold">{p.home}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-slate-500">Best Pick</p>
                      <p className="mt-1 text-3xl font-black text-cyan-300">
                        {pct(p.best.prob)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {p.best.label}
                      </p>
                    </div>

                    <div className="text-center">
                      <TeamBadge team={p.away} size={56} />
                      <p className="mt-2 text-sm font-bold">{p.away}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                    <Mini label="Home" value={pct(p.homeWin)} />
                    <Mini label="Draw" value={pct(p.draw)} />
                    <Mini label="Away" value={pct(p.awayWin)} />
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-cyan-300">{value}</p>
    </div>
  );
}
