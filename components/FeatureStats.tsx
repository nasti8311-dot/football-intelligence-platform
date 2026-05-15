const stats = [
  ["92%", "Prediction Accuracy"],
  ["20K+", "Tracked Events"],
  ["500+", "Processed Matches"],
  ["AI", "Scouting Engine"],
];

export default function FeatureStats() {
  return (
    <section className="grid gap-6 md:grid-cols-4">
      {stats.map(([value, label]) => (
        <div
          key={label}
          className="glass-card rounded-3xl p-8 text-center"
        >
          <p className="text-5xl font-black text-cyan-300">
            {value}
          </p>

          <p className="mt-3 text-slate-400">
            {label}
          </p>
        </div>
      ))}
    </section>
  );
}
