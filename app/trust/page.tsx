import PageHero from "@/components/PageHero";

const items = [
  ["Private Database", "Football data is stored in a dedicated Supabase database."],
  ["Production Hosting", "The platform is deployed on Vercel with modern Next.js infrastructure."],
  ["Data Transparency", "The system separates imported match data from synthetic demo enrichments."],
  ["Scalable Architecture", "Prisma, PostgreSQL and modular dashboards make the platform expandable."],
];

export default function TrustPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHero
          eyebrow="Trust"
          title="Trust & Architecture"
          description="A clear overview of the platform foundation, data handling and technical setup."
        />

        <section className="grid gap-6 md:grid-cols-2">
          {items.map(([title, text]) => (
            <div key={title} className="glass-card rounded-3xl p-7">
              <div className="mb-5 h-3 w-3 rounded-full bg-emerald-400" />
              <h2 className="text-3xl font-black">{title}</h2>
              <p className="mt-4 text-slate-300">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
