import PageHero from "@/components/PageHero";

const modules = [
  "Custom club branding",
  "Private analytics dashboard",
  "Scout report exports",
  "Role-based views for coach, scout and analyst",
  "Custom data feeds",
  "Enterprise onboarding",
];

export default function WhiteLabelPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHero
          eyebrow="Enterprise"
          title="White Label Platform"
          description="A branded football analytics cockpit for clubs, academies and agencies."
        />

        <section className="grid gap-5 md:grid-cols-2">
          {modules.map((m) => (
            <div key={m} className="glass-card rounded-3xl p-6">
              <p className="text-2xl font-black">✓ {m}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
