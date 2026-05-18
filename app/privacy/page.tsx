import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Privacy</p>
          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">Privacy Policy</h1>
          <p className="mt-5 text-slate-300">
            We aim to keep the platform privacy-friendly and focused on football analytics.
          </p>
          <Link href="/" className="mt-6 inline-block rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
            Back to predictions
          </Link>
        </section>

        <section className="glass-card rounded-3xl p-6 text-slate-300">
          <h2 className="text-2xl font-black text-cyan-300">Data collection</h2>
          <p className="mt-3">
            The platform may process technical analytics and publicly available football data to improve predictions.
          </p>

          <h2 className="mt-8 text-2xl font-black text-cyan-300">Third-party sources</h2>
          <p className="mt-3">
            Some content may come from sports data, odds and news providers. Their availability can vary.
          </p>

          <h2 className="mt-8 text-2xl font-black text-cyan-300">Contact</h2>
          <p className="mt-3">
            For privacy-related questions, contact the website owner.
          </p>
        </section>
      </div>
    </main>
  );
}
