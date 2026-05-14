import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventMapPage() {
  const events = await prisma.event.findMany({
    take: 700,
    orderBy: { minute: "asc" },
  });

  const shots = events.filter((e) => e.eventType === "shot");
  const passes = events.filter((e) => e.eventType === "pass");

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Visual Analytics</p>
          <h1 className="text-5xl font-bold">Event Map Pro</h1>
          <p className="mt-3 text-slate-400">
            Passlinien, Shotmap und Eventpositionen auf dem Spielfeld.
          </p>
        </section>

        <section className="relative aspect-[105/68] overflow-hidden rounded-3xl border-4 border-white/20 bg-emerald-900">
          <div className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
          <div className="absolute left-0 top-1/2 h-40 w-16 -translate-y-1/2 border border-white/30" />
          <div className="absolute right-0 top-1/2 h-40 w-16 -translate-y-1/2 border border-white/30" />

          <svg className="absolute inset-0 h-full w-full">
            {passes.map((e) => (
              <line
                key={e.id}
                x1={`${Number(e.x ?? 50)}%`}
                y1={`${Number(e.y ?? 50)}%`}
                x2={`${Number(e.endX ?? e.x ?? 50)}%`}
                y2={`${Number(e.endY ?? e.y ?? 50)}%`}
                stroke="rgba(103,232,249,0.35)"
                strokeWidth="1.5"
              />
            ))}
          </svg>

          {events.map((e) => {
            const size =
              e.eventType === "shot"
                ? Math.max(10, Number(e.xg ?? 0.1) * 40)
                : 8;

            return (
              <div
                key={e.id}
                title={`${e.team} · ${e.player ?? "Unknown"} · ${e.eventType}`}
                className={`absolute rounded-full ${
                  e.eventType === "shot"
                    ? "bg-red-400"
                    : e.eventType === "pass"
                    ? "bg-cyan-300"
                    : "bg-yellow-300"
                }`}
                style={{
                  width: size,
                  height: size,
                  left: `${Math.min(100, Math.max(0, Number(e.x ?? 50)))}%`,
                  top: `${Math.min(100, Math.max(0, Number(e.y ?? 50)))}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card title="Events" value={events.length.toString()} />
          <Card title="Shots" value={shots.length.toString()} />
          <Card title="Passes" value={passes.length.toString()} />
          <Card
            title="Avg xG"
            value={
              shots.length
                ? (
                    shots.reduce((s, e) => s + Number(e.xg ?? 0), 0) /
                    shots.length
                  ).toFixed(2)
                : "0.00"
            }
          />
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
