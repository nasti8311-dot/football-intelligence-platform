export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function LivePage() {
  const events = await prisma.event.findMany({
    orderBy: {
      minute: "asc",
    },
  });

  const momentum = new Map<number, number>();

  for (const e of events) {
    const bucket = Math.floor(e.minute / 5) * 5;

    let value = momentum.get(bucket) ?? 0;

    if (e.eventType === "shot") {
      value += 8 + Number(e.xg ?? 0) * 10;
    }

    if (e.eventType === "pass") {
      value += 1;
    }

    if (e.eventType === "pressure") {
      value += 2;
    }

    momentum.set(bucket, value);
  }

  const chart = [...momentum.entries()]
    .map(([minute, value]) => ({
      minute,
      value,
    }))
    .sort((a, b) => a.minute - b.minute);

  const total = chart.reduce((s, c) => s + c.value, 0);

  const winProbability = Math.min(
    95,
    Math.max(5, 50 + total * 0.4)
  );

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Live Intelligence
          </p>

          <h1 className="text-5xl font-bold">
            Live Match Engine
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Echtzeit-Momentum, Match-Control und
            Win Probability aus Eventdaten.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card
            title="Events"
            value={events.length.toString()}
          />

          <Card
            title="Momentum Buckets"
            value={chart.length.toString()}
          />

          <Card
            title="Win Probability"
            value={`${winProbability.toFixed(1)}%`}
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="mb-6 text-2xl font-semibold">
            Live Momentum
          </h2>

          <div className="space-y-4">
            {chart.map((c) => (
              <div key={c.minute}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-400">
                    {c.minute}'
                  </span>

                  <span className="text-cyan-300">
                    {c.value.toFixed(1)}
                  </span>
                </div>

                <div className="h-4 rounded-full bg-slate-800">
                  <div
                    className="h-4 rounded-full bg-cyan-400"
                    style={{
                      width: `${Math.min(
                        100,
                        c.value * 4
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-6">
          <p className="text-sm text-cyan-300">
            Automated Match Insight
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {winProbability >= 60
              ? "Dominante Matchkontrolle erkannt"
              : "Ausgeglichenes Spielprofil"}
          </h2>

          <div className="mt-5 space-y-2 text-slate-300">
            <p>
              • Die Momentum-Kurve basiert auf
              Shots, Pressing und Ballzirkulation.
            </p>

            <p>
              • Die Win Probability wird dynamisch
              aus Match-Events berechnet.
            </p>

            <p>
              • Höhere xG- und Shot-Volumen
              verstärken die Dominanzbewertung.
            </p>
          </div>
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
