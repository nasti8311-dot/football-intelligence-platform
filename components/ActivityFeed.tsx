const feed = [
  "AI scouting model updated Liverpool profiles",
  "New xG clusters generated for Arsenal",
  "Opponent prep created for Bayern",
  "Prediction engine recalculated Bundesliga probabilities",
  "Match Center processed 4,200 events",
  "Scout Dashboard identified 3 elite players",
];

export default function ActivityFeed() {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <p className="text-sm text-cyan-300">
          System Activity
        </p>

        <h2 className="mt-1 text-3xl font-black">
          Live Feed
        </h2>
      </div>

      <div className="space-y-4">
        {feed.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-2xl bg-slate-950/60 p-4"
          >
            <div className="mt-1 h-3 w-3 rounded-full bg-cyan-400" />

            <div>
              <p className="font-medium text-slate-200">
                {item}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Live system event
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
