export default function LiveTicker() {
  const items = [
    "⚽ Bayern attacking efficiency increased by 12%",
    "📈 Arsenal possession model updated",
    "🔥 Liverpool top scouting score this week",
    "🧠 AI prediction engine active",
    "🎯 Match Center processing live events",
  ];

  return (
    <div className="glass-card overflow-hidden rounded-2xl py-3">
      <div className="ticker flex gap-16 whitespace-nowrap px-6 text-sm font-semibold text-cyan-300">
        {items.concat(items).map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
