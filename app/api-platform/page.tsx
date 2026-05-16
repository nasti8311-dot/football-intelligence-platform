import PageHero from "@/components/PageHero";

const endpoints = [
  ["GET /matches", "Retrieve match data"],
  ["GET /teams", "Retrieve team profiles"],
  ["GET /players", "Retrieve player data"],
  ["GET /events", "Retrieve football events"],
  ["POST /upload", "Upload football datasets"],
];

export default function APIPlatformPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHero
          eyebrow="Developer Platform"
          title="API Platform"
          description="A future API layer for football data access and integrations."
        />

        <section className="grid gap-5">
          {endpoints.map(([endpoint, desc]) => (
            <div key={endpoint} className="glass-card rounded-3xl p-6">
              <code className="text-xl font-black text-cyan-300">
                {endpoint}
              </code>

              <p className="mt-3 text-slate-300">
                {desc}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
