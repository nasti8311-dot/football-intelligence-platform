import { prisma } from "@/lib/prisma";

export default async function FeatureStorePage() {
  const events = await prisma.event.findMany();

  const features = {
    totalEvents: events.length,
    shots: events.filter((e) => e.eventType === "shot").length,
    passes: events.filter((e) => e.eventType === "pass").length,
    pressures: events.filter((e) => e.eventType === "pressure").length,
    withPlayer: events.filter((e) => e.player).length,
    withXg: events.filter((e) => e.xg != null).length,
    withCoordinates: events.filter(
      (e) => e.x != null && e.y != null
    ).length,
  };

  const registry = [
    {
      name: "xG Feature",
      category: "Finishing",
      description: "Expected Goals per shot",
    },
    {
      name: "Progressive Passing",
      category: "Build-Up",
      description: "Forward ball progression",
    },
    {
      name: "Pressure Intensity",
      category: "Defending",
      description: "Pressing frequency",
    },
    {
      name: "Possession Value",
      category: "Tactical",
      description: "Value added by possession",
    },
    {
      name: "xThreat",
      category: "Attacking",
      description: "Danger creation model",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Machine Learning Infrastructure
          </p>

          <h1 className="text-5xl font-bold">
            Feature Store
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Zentrale ML-Feature-Verwaltung für
            Prediction-, Tactical- und
            Recruitment-Modelle.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card
            title="Events"
            value={features.totalEvents.toString()}
          />

          <Card
            title="Shots"
            value={features.shots.toString()}
          />

          <Card
            title="Passes"
            value={features.passes.toString()}
          />

          <Card
            title="Pressure"
            value={features.pressures.toString()}
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="mb-5 text-2xl font-semibold">
            Feature Registry
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {registry.map((f) => (
              <div
                key={f.name}
                className="rounded-2xl bg-slate-900 p-5"
              >
                <p className="text-sm text-cyan-300">
                  {f.category}
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  {f.name}
                </h3>

                <p className="mt-2 text-slate-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-6">
          <p className="text-sm text-cyan-300">
            ML Readiness
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Deine Plattform besitzt jetzt eine
            zentrale Feature-Infrastruktur.
          </h2>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}
