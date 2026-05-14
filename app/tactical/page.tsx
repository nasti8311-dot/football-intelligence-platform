import { Activity, Crosshair, Flame, Network, Radar } from "lucide-react";

const zones = [
  { name: "Left Wing", value: 68 },
  { name: "Half Space L", value: 74 },
  { name: "Center", value: 81 },
  { name: "Half Space R", value: 69 },
  { name: "Right Wing", value: 62 },
];

const shots = [
  { x: 72, y: 42, xg: 0.31 },
  { x: 84, y: 51, xg: 0.47 },
  { x: 61, y: 35, xg: 0.12 },
  { x: 78, y: 64, xg: 0.21 },
  { x: 89, y: 45, xg: 0.59 },
];

export default function TacticalPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Advanced Football Intelligence</p>
          <h1 className="text-4xl font-bold">Tactical Analytics</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Shot maps, field tilt, tactical zones and possession intelligence.
            This layer is prepared for real event-data feeds.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card icon={<Crosshair />} title="Total xG" value="2.14" />
          <Card icon={<Activity />} title="Field Tilt" value="63%" />
          <Card icon={<Network />} title="Pass Network" value="428" />
          <Card icon={<Flame />} title="Momentum" value="+18%" />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-xl font-semibold">Shot Map</h2>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-emerald-400/30 bg-emerald-950">
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
              <div className="absolute left-[75%] top-[25%] h-1/2 w-[18%] rounded border border-white/40" />
              <div className="absolute left-[88%] top-[38%] h-1/4 w-[8%] rounded border border-white/40" />
              {shots.map((s, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/40"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${18 + s.xg * 35}px`,
                    height: `${18 + s.xg * 35}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                  title={`xG ${s.xg}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-xl font-semibold">Tactical Zones</h2>
            <div className="space-y-4">
              {zones.map((z) => (
                <div key={z.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{z.name}</span>
                    <span className="text-cyan-300">{z.value}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-cyan-400"
                      style={{ width: `${z.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Radar className="text-cyan-300" />
            <h2 className="text-xl font-semibold">Model Notes</h2>
          </div>
          <p className="text-slate-400">
            Diese Ansicht nutzt aktuell berechnete Beispiel-Eventstrukturen.
            Der nächste professionelle Schritt ist ein CSV/Event-Importer für
            echte Schuss-, Pass- und Positionsdaten.
          </p>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 text-cyan-300">{icon}</div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
