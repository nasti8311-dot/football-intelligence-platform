import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventMapPage() {
  const events = await prisma.event.findMany({
    take: 500,
    orderBy: { minute: "asc" },
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Visual Analytics</p>
          <h1 className="text-5xl font-bold">Event Map</h1>
          <p className="mt-3 text-slate-400">
            Shotmap, Passmap und Eventpositionen auf dem Spielfeld.
          </p>
        </section>

        <section className="relative aspect-[105/68] rounded-3xl border-4 border-white/20 bg-emerald-900">
          <div className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />

          {events.map((e) => (
            <div
              key={e.id}
              title={`${e.team} · ${e.player ?? "Unknown"} · ${e.eventType}`}
              className={`absolute h-3 w-3 rounded-full ${
                e.eventType === "shot"
                  ? "bg-red-400"
                  : e.eventType === "pass"
                  ? "bg-cyan-300"
                  : "bg-yellow-300"
              }`}
              style={{
                left: `${Math.min(100, Math.max(0, Number(e.x ?? 50)))}%`,
                top: `${Math.min(100, Math.max(0, Number(e.y ?? 50)))}%`,
              }}
            />
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card title="Events shown" value={events.length.toString()} />
          <Card title="Shots" value={events.filter(e => e.eventType === "shot").length.toString()} />
          <Card title="Passes" value={events.filter(e => e.eventType === "pass").length.toString()} />
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
