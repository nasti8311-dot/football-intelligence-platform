import PageHero from "@/components/PageHero";

const notifications = [
  ["High Priority", "Scout model found 3 high-value player profiles."],
  ["Data", "Event coverage is strong enough for visual maps."],
  ["Prediction", "Match probability model has been recalculated."],
  ["Coach", "Opponent Prep recommends reducing central shots."],
  ["System", "Database connection is active and analytics are online."],
];

export default function NotificationCenterPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHero
          eyebrow="Alerts"
          title="Notification Center"
          description="Important system alerts, scouting updates and football intelligence signals."
        />

        <section className="grid gap-4">
          {notifications.map(([tag, text]) => (
            <div key={text} className="glass-card rounded-3xl p-6">
              <p className="text-sm text-cyan-300">{tag}</p>
              <p className="mt-2 text-xl font-bold text-slate-100">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
