const plans = [
  {
    name: "Scout",
    price: "€29",
    features: ["Player Analytics", "Scouting Dashboard", "CSV Import"],
  },
  {
    name: "Analyst",
    price: "€119",
    features: ["Predictions", "Event Intelligence", "Team Style Models"],
  },
  {
    name: "Club Pro",
    price: "€999",
    features: ["Recruitment AI", "Live Match Engine", "API Access"],
  },
];

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-emerald-400">SaaS Monetization</p>
          <h1 className="text-5xl font-bold">Billing Plans</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Subscription-Struktur für deine Football Intelligence Platform.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <h2 className="text-3xl font-bold">{p.name}</h2>
              <p className="mt-4 text-5xl font-black text-emerald-300">
                {p.price}
              </p>
              <p className="mt-2 text-slate-400">per month</p>

              <div className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <p key={f} className="text-slate-300">
                    ✓ {f}
                  </p>
                ))}
              </div>

              <button className="mt-8 w-full rounded-2xl bg-emerald-400 p-4 font-bold text-slate-950">
                Choose Plan
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
