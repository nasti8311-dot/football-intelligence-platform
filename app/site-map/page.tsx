import Link from "next/link";

const pages = [
  "/", "/verified-picks", "/quant-hub", "/model-quality", "/performance",
  "/value-analysis", "/xg-lab", "/readiness", "/status", "/launch-checklist",
  "/methodology", "/public-track-record", "/about", "/roadmap", "/changelog",
  "/contact", "/disclaimer"
];

export default function SiteMapPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">Football IQ</p>
          <h1 className="mt-3 text-5xl font-black">Site Map</h1>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {pages.map((page) => (
            <Link key={page} href={page} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-bold text-neutral-300 hover:text-white">
              {page}
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
