const bars = [
  ["Attack", 88],
  ["Defense", 74],
  ["Possession", 91],
  ["Pressing", 69],
  ["Scouting", 95],
];

export default function PerformanceBars() {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <p className="text-sm text-cyan-300">
          Platform Performance
        </p>

        <h2 className="mt-1 text-3xl font-black">
          Analytics Status
        </h2>
      </div>

      <div className="space-y-5">
        {bars.map(([label, value]) => (
          <div key={label}>
            <div className="mb-2 flex justify-between">
              <span className="text-sm text-slate-300">
                {label}
              </span>

              <span className="text-sm font-bold text-cyan-300">
                {value}%
              </span>
            </div>

            <div className="h-3 rounded-full bg-slate-800">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
