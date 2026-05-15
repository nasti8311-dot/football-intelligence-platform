export default function HeatmapPreview() {
  const points = Array.from({ length: 40 }).map((_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 10 + Math.random() * 30,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <p className="text-sm text-cyan-300">
          Tactical Intelligence
        </p>

        <h2 className="mt-1 text-3xl font-black">
          Heatmap Preview
        </h2>
      </div>

      <div className="relative aspect-[105/68] overflow-hidden rounded-3xl border border-white/10 bg-emerald-950">
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />

        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

        {points.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400 blur-xl"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
