export default function AnalyticsOverview() {
  const items = [
    ["Attack Model", "Active"],
    ["xG Engine", "Running"],
    ["Scouting AI", "Online"],
    ["Prediction Core", "Stable"],
  ];

  return (
    <section className="grid gap-5 md:grid-cols-4">
      {items.map(([title, status]) => (
        <div
          key={title}
          className="glass-card rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-3 rounded-full bg-emerald-400" />

            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {status}
            </span>
          </div>

          <h3 className="mt-6 text-2xl font-black">
            {title}
          </h3>

          <div className="mt-4 h-2 rounded-full bg-slate-800">
            <div className="h-2 w-[85%] rounded-full bg-cyan-400" />
          </div>
        </div>
      ))}
    </section>
  );
}
