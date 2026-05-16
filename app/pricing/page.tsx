import Link from "next/link";
import PageHero from "@/components/PageHero";

const plans = [
  {
    name: "Starter",
    price: "€49",
    desc: "For individual analysts and small projects.",
    features: ["Match dashboards", "Basic scouting", "CSV imports", "Team reports"],
  },
  {
    name: "Pro",
    price: "€199",
    desc: "For clubs, agencies and serious football workflows.",
    features: ["AI scout reports", "Opponent prep", "Prediction center", "Event maps", "Transfer market"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For professional clubs and data teams.",
    features: ["Custom data feeds", "Private models", "Team accounts", "API access", "White-label reports"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Commercial"
          title="Pricing"
          description="Turn football analytics into a real SaaS product with clear plans."
        />

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="glass-card rounded-3xl p-8">
              <h2 className="text-3xl font-black">{plan.name}</h2>
              <p className="mt-3 text-slate-400">{plan.desc}</p>

              <p className="mt-8 text-5xl font-black text-cyan-300">
                {plan.price}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                per month
              </p>

              <div className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="rounded-2xl bg-slate-950/60 p-3 text-slate-300">
                    ✓ {f}
                  </div>
                ))}
              </div>

              <Link
                href="/contact"
                className="mt-8 block rounded-2xl bg-cyan-400 px-5 py-4 text-center font-bold text-slate-950"
              >
                Get Started
              </Link>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
