import PageHero from "@/components/PageHero";

const modules = [
  ["Database", "Online", "Supabase connected"],
  ["Deployment", "Online", "Vercel production ready"],
  ["Imports", "Active", "CSV pipeline available"],
  ["Reports", "Active", "Scout and coach views enabled"],
  ["AI Layer", "Demo", "Synthetic intelligence active"],
  ["Billing", "Planned", "Stripe integration next"],
];

export default function OperationsCenterPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Operations"
          title="Operations Center"
          description="A system overview for platform status, modules and next technical priorities."
        />

        <section className="grid gap-6 md:grid-cols-3">
          {modules.map(([name, status, text]) => (
            <div key={name} className="glass-card rounded-3xl p-7">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-3xl font-black">{name}</h2>
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>

              <p className="text-2xl font-black text-cyan-300">{status}</p>
              <p className="mt-3 text-slate-300">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
