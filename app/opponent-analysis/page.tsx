export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

type Team = {
  team: string;
  events: number;
  shots: number;
  passes: number;
  pressures: number;
  xg: number;
  directPasses: number;
};

function rating(t: Team) {
  return {
    attack: t.shots * 3 + t.xg * 25,
    control: t.passes * 0.8,
    press: t.pressures * 2,
    directness: t.directPasses * 2,
  };
}

export default async function OpponentAnalysisPage() {
  const events = await prisma.event.findMany();

  const map = new Map<string, Team>();

  for (const e of events) {
    if (!map.has(e.team)) {
      map.set(e.team, {
        team: e.team,
        events: 0,
        shots: 0,
        passes: 0,
        pressures: 0,
        xg: 0,
        directPasses: 0,
      });
    }

    const t = map.get(e.team)!;
    t.events++;

    if (e.eventType === "shot") {
      t.shots++;
      t.xg += Number(e.xg ?? 0);
    }

    if (e.eventType === "pass") {
      t.passes++;

      if (
        e.x != null &&
        e.endX != null &&
        e.endX - e.x >= 20
      ) {
        t.directPasses++;
      }
    }

    if (e.eventType === "pressure") {
      t.pressures++;
    }
  }

  const teams = [...map.values()];

  const home = teams[0];
  const away = teams[1];

  const homeR = home ? rating(home) : null;
  const awayR = away ? rating(away) : null;

  const matchup =
    home && away && homeR && awayR
      ? {
          attackEdge: homeR.attack - awayR.attack,
          controlEdge: homeR.control - awayR.control,
          pressEdge: homeR.press - awayR.press,
          transitionEdge:
            homeR.directness - awayR.directness,
        }
      : null;

  const insights: string[] = [];

  if (home && away && matchup) {
    insights.push(
      matchup.attackEdge >= 0
        ? `${home.team} hat den offensiven Vorteil gegenüber ${away.team}.`
        : `${away.team} hat den offensiven Vorteil gegenüber ${home.team}.`
    );

    insights.push(
      matchup.controlEdge >= 0
        ? `${home.team} kontrolliert das Spiel wahrscheinlich stärker.`
        : `${away.team} kontrolliert das Spiel wahrscheinlich stärker.`
    );

    insights.push(
      matchup.pressEdge >= 0
        ? `${home.team} zeigt mehr Pressing-Aktivität.`
        : `${away.team} zeigt mehr Pressing-Aktivität.`
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Match Preparation
          </p>

          <h1 className="text-5xl font-bold">
            Opponent Analysis
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Automatischer Gegnervergleich aus
            Eventdaten.
          </p>
        </section>

        {!home || !away ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-slate-400">
            Es werden mindestens zwei Teams mit
            Eventdaten benötigt.
          </section>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-2">
              <TeamPanel team={home} title="Team A" />
              <TeamPanel team={away} title="Team B" />
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="mb-5 text-2xl font-semibold">
                Matchup Edges
              </h2>

              <div className="space-y-4">
                <Edge
                  label="Attack Edge"
                  value={matchup!.attackEdge}
                />

                <Edge
                  label="Control Edge"
                  value={matchup!.controlEdge}
                />

                <Edge
                  label="Pressing Edge"
                  value={matchup!.pressEdge}
                />

                <Edge
                  label="Transition Edge"
                  value={matchup!.transitionEdge}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-6">
              <p className="text-sm text-cyan-300">
                Automated Opponent Report
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Tactical Matchup Summary
              </h2>

              <div className="mt-5 space-y-3 text-slate-300">
                {insights.map((i) => (
                  <p key={i}>• {i}</p>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function TeamPanel({
  team,
  title,
}: {
  team: Team;
  title: string;
}) {
  const r = rating(team);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm text-cyan-400">
        {title}
      </p>

      <h2 className="mt-1 text-3xl font-bold">
        {team.team}
      </h2>

      <div className="mt-6 space-y-4">
        <Bar label="Attack" value={r.attack} />
        <Bar label="Control" value={r.control} />
        <Bar label="Pressing" value={r.press} />
        <Bar
          label="Directness"
          value={r.directness}
        />
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2 text-xs">
        <Mini label="Shots" value={team.shots} />

        <Mini label="Passes" value={team.passes} />

        <Mini
          label="Pressures"
          value={team.pressures}
        />

        <Mini
          label="xG"
          value={Number(team.xg.toFixed(2))}
        />
      </div>
    </section>
  );
}

function Edge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const abs = Math.min(
    100,
    Math.abs(value) * 4
  );

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">
          {label}
        </span>

        <span
          className={
            value >= 0
              ? "text-cyan-300"
              : "text-red-300"
          }
        >
          {value.toFixed(1)}
        </span>
      </div>

      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-cyan-400"
          style={{ width: `${abs}%` }}
        />
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">
          {label}
        </span>

        <span className="text-cyan-300">
          {value.toFixed(1)}
        </span>
      </div>

      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-cyan-400"
          style={{
            width: `${Math.min(100, value)}%`,
          }}
        />
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-900 p-3 text-center">
      <p className="text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}
